var {doCreateCall, new_resolve } = require('./libs')

module.exports = function(RED) {
  /** Create call */
  function create_call(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {accountSid, apiToken} = server.credentials;
      const url = server.url
      if (!url || !accountSid || !apiToken) {
        node.error(`invalid / missing credentials, skipping create-call node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = await new_resolve(RED, config.from, config.fromType, node, msg);
      var to = await new_resolve(RED, config.to, config.toType, node, msg);
      var tag = await new_resolve(RED, config.tag, config.tagType, node, msg);

      const opts = {
        from,
        to: {
          type: config.dest
        },
        tag
      };

      if (config.headers) {
        var headers = {};
        config.headers.forEach(function(h) {
          if (h.h.length && h.v.length) headers[h.h] = h.v;
        });
        Object.assign(opts, {headers});
      }

      if (config.callername) {
        opts.callerName = await new_resolve(RED, config.callername, config.callernameType, node, msg);
      }

      switch (config.mode) {
        case 'app':
          opts.application_sid = config.application;
          break
        case 'url':
          opts.call_hook = {
            url:  await new_resolve(RED, config.call_hook_url, config.call_hook_urlType, node, msg),
            method: config.call_hook_method
          };
          opts.call_status_hook = {
            url: await new_resolve(RED, config.call_status_url, config.call_status_urlType, node, msg),
            method: config.call_status_method
          };
          opts.speech_synthesis_vendor = config.vendor;
          opts.speech_synthesis_language = config.lang;
          opts.speech_synthesis_voice = config.voice;
          opts.speech_recognizer_vendor = config.transcriptionvendor;
          opts.speech_recognizer_language = config.recognizerlang;
          break;
      }

      if (config.timeout) {
        const timeout = parseInt(config.timeout);
        if (timeout > 0) opts.timeout = timeout;
      }

      switch (config.dest) {
        case 'phone':
          if (config.trunk) {
            var trunk = await new_resolve(RED, config.trunk, config.trunkType, node, msg);
            opts.to.trunk = trunk;
          }
          opts.to.number = to;
          break;
        case 'user':
          opts.to.name = to;
          break;
        case 'sip':
          opts.to.sipUri = to;
          break;
        case 'ms-teams':
          opts.to.user = to;
          break;
        default:
          if (done) done(`unknown dest type ${config.dest}`);
          else node.error(`unknown dest type ${config.dest}`, msg);
          send(msg);
          return;
      }
      try {
        const response = await doCreateCall(node, url, accountSid, apiToken, opts);
        msg.statusCode = 201;
        msg.callSid = response.sid;
        msg.callId = response.callId;
      } catch (err) {
        if (err.statusCode) {
          node.error(`create-call failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error sending create call ${err.message}`;
          if (done) done(errorMessage);
          else node.error(errorMessage, msg);
          msg.errorMessage = errorMessage;
          send(msg);
          return;
        }
      }
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('create-call', create_call);
}