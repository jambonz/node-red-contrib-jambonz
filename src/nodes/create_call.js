var {v_resolve, doCreateCall, } = require('./libs')

module.exports = function(RED) {
  /** Create call */
  function create_call(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async(msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {accountSid, apiToken} = server.credentials;
      const url = server.url
      if (!url || !accountSid || !apiToken) {
        node.error(`invalid / missing credentials, skipping create-call node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = v_resolve(config.from, config.fromType, this.context(), msg);
      var to = v_resolve(config.to, config.toType, this.context(), msg);

      const opts = {
        from,
        to: {
          type: config.dest
        },
      };

      switch (config.mode) {
        case 'app':
          opts.application_sid = config.application;
          break
        case 'url':
          opts.call_hook = {
            url: v_resolve(config.call_hook_url, config.call_hook_urlType, this.context(), msg),
            method: config.call_hook_method
          };
          opts.call_status_hook = {
            url: v_resolve(config.call_status_url, config.call_status_urlType, this.context(), msg),
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
        node.log(`sending create call ${JSON.stringify(opts)}`);
        const res = await doCreateCall(url, accountSid, apiToken, opts);
        msg.statusCode = 201;
        msg.callSid = res.sid;
        msg.callId = res.callId;
      } catch (err) {
        if (err.statusCode) {
          node.log(JSON.stringify(err));
          try {
            const responseBody = await err.json();
            node.error(`create-call failed with ${err.statusCode}. Response ${JSON.stringify(responseBody)}`);
          } catch (e) {
            node.error(`create-call failed with ${err.statusCode}`);
          }
          msg.statusCode = err.statusCode;
        }
        else {
          node.error(`Error sending create call ${JSON.stringify(err)}`);
          if (done) done(err);
          else node.error(err, msg);
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