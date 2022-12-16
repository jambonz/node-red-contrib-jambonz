var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {v_resolve, doCreateMessage} = require('./libs')


module.exports = function(RED) {
/** Create sms */
function create_sms(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async(msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {accountSid, apiToken} = server.credentials;
      const url = server.url
      if (!url || !accountSid || !apiToken) {
        node.log(`invalid / missing credentials, skipping create-message node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = v_resolve(config.from, config.fromType, this.context(), msg);
      var to = v_resolve(config.to, config.toType, this.context(), msg);
      var text = v_resolve(config.text, config.textType, this.context(), msg);
      var provider = v_resolve(config.provider, config.providerType, this.context(), msg);

      const opts = {
        from,
        to,
        text,
        provider
      };

      try {
        node.log(`sending create message ${JSON.stringify(opts)}`);
        const res = await doCreateMessage(url, accountSid, apiToken, opts);
        msg.statusCode = 202;
        msg.messageSid = res.sid;
        msg.providerResponse = res.providerResponse;
        node.log(`successfully launched call with messageSid ${msg.messageSid}`);
      } catch (err) {
        if (err.statusCode) {
          node.log(`create_message failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
        }
        else {
          node.log(`Error sending create message ${JSON.stringify(err)}`);
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
  RED.nodes.registerType('create-sms', create_sms);

}