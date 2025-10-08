var {doCreateCall, new_resolve } = require('./libs')

module.exports = function(RED) {
  /** Create call */
  function create_call(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const url = await new_resolve(RED, server.url, server.urlType, node, msg);
      const accountSid = await new_resolve(RED, server.credentials.accountSid, server.accountSidType, node, msg);
      const apiToken = await new_resolve(RED, server.credentials.apiToken, server.apiTokenType, node, msg);

      if (!url || !accountSid || !apiToken) {
        node.error(`invalid / missing credentials, skipping create-call node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = await new_resolve(RED, config.from, config.fromType, node, msg);
      var to = await new_resolve(RED, config.to, config.toType, node, msg);
      var tag = await new_resolve(RED, config.tag, config.tagType, node, msg);
      var timeout = await new_resolve(RED, config.timeout, config.timeoutType, node, msg);

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

      if (timeout) {
        timeout = parseInt(timeout);
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
          var sipauth_user = await new_resolve(RED, config.sipauth_user, config.sipauth_userType, node, msg);
          var sipauth_password = await new_resolve(RED, config.sipauth_password, config.sipauth_passwordType, node, msg);
          var sip_proxy = await new_resolve(RED, config.sip_proxy, config.sip_proxyType, node, msg);
          opts.to.sipUri = to;
          sip_proxy ? opts.to.proxy = sip_proxy : null
          sipauth_user ? opts.to.auth = { username :sipauth_user, password: sipauth_password} : null
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

      // AMD
      const _amd_actionHook =  await new_resolve(RED, config.amd_actionHook, config.amd_actionHookType, node, msg)
      if (_amd_actionHook){
        opts.amd = {}
        opts.amd.actionHook = _amd_actionHook;
        config.amd_thresholdWordCount && (opts.amd.thresholdWordCount = Number(config.amd_thresholdWordCount))
        config.amd_digitCount && (opts.amd.digitCount = Number(config.amd_digitCount))
        opts.amd.timers = {
          ...(config.amd_timers_decisionTimeoutMs && {decisionTimeoutMs: Number(config.amd_timers_decisionTimeoutMs)}),
          ...(config.amd_timers_greetingCompletionTimeoutMs && {greetingCompletionTimeoutMs: Number(config.amd_timers_greetingCompletionTimeoutMs)}),
          ...(config.amd_timers_noSpeechTimeoutMs && {noSpeechTimeoutMs: Number(config.amd_timers_noSpeechTimeoutMs)}),
          ...(config.amd_timers_toneTimeoutMs && {toneTimeoutMs: Number(config.amd_timers_toneTimeoutMs)}),
        }
        //If none of the timer values are set remove the object
        if (Object.keys(opts.amd.timers).length == 0){
          delete(opts.amd.timers)
        }
        //If custom recogniser is used
        if (config.amd_recognizer_vendor != 'default'){
          opts.amd.recognizer = {
            ...(config.amd_recognizer_vendor && {vendor : config.amd_recognizer_vendor}),
            ...(config.amd_recognizer_lang && {language : config.amd_recognizer_lang})
          }
        }
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