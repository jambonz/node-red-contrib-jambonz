var {v_resolve, doLCC} = require('./libs')

module.exports = function(RED) {
/** LCC */
function lcc(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async(msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {accountSid, apiToken} = server.credentials;
      const url = server.url;
      const callSid = v_resolve(config.callSid, config.callSidType, this.context(), msg);
      if (!url || !accountSid || !apiToken || !callSid) {
        node.log(`invalid / missing credentials or callSid, skipping LCC node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      const opts = {};
      switch (config.action) {
        case 'hangup':
          opts.call_status = 'completed';
          break;
        case 'mute':
          opts.mute_status = 'mute';
          break;
        case 'unmute':
          opts.mute_status = 'unmute';
          break;
        case 'mute_conf':
          opts.conf_mute_status = 'mute';
          break;
        case 'unmute_conf':
          opts.conf_mute_status = 'unmute';
          break;
        case 'pause':
          opts.listen_status = 'pause';
          break;
        case 'resume':
          opts.listen_status = 'resume';
          break;
        case 'redirect':
          node.log(`LCC redirect callHook ${config.callHook} callHookType: ${config.callHookType}`);
          opts.call_hook = {url: v_resolve(config.callHook, config.callHookType, this.context(), msg)};
          break;
        case 'hold_conf':
          opts.conf_hold_status = 'hold';
          opts.wait_hook = {url: v_resolve(config.waitHook, config.waitHookType, this.context(), msg)};
          break;
        case 'unhold_conf':
          opts.conf_hold_status = 'unhold';
        case 'whisper':
          Object.assign(opts, {
            whisper: {
              verb: 'say',
              text: config.text
            }
          });
          if (['aws', 'google'].includes(config.vendor)) {
            Object.assign(opts.whisper, {
              synthesizer: {
                vendor: config.vendor,
                language: config.lang,
                voice: config.voice
              }
            });
          }
          break;
        default:
          node.log(`invalid action: ${config.action}`);
          send(msg);
          if (done) done();
          return;
      }

      try {
        msg.payload = await doLCC(node, url, accountSid, apiToken, callSid, opts);
        msg.statusCode = 202;
      } catch (err) {
        if (err.statusCode) msg.statusCode = err.statusCode;
        else {
          node.error(`Error sending LCC ${JSON.stringify(err)}`);
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
  RED.nodes.registerType('lcc', lcc);
}