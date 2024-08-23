var {doCreateMessage, new_resolve} = require('./libs')

module.exports = function(RED) {
/** Create sms */
function create_sms(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {accountSid, apiToken} = server.credentials;
      const url = server.url
      if (!url || !accountSid || !apiToken) {
        node.log(`invalid / missing credentials, skipping create-message node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = await new_resolve(RED, config.from, config.fromType, node, msg)
      var to = await new_resolve(RED, config.to, config.toType, node, msg)
      var text = await new_resolve(RED, config.text, config.textType, node, msg);
      var provider = await new_resolve(RED, config.provider, config.providerType, node, msg)

      const opts = {
        from,
        to,
        text,
        provider
      };
      try {
        const response = await doCreateMessage(node, url, accountSid, apiToken, opts);
        msg.statusCode = 201;
        msg.messageSid = response.sid;
        msg.providerResponse = response.providerResponse;
      } catch (err) {
        if (err.statusCode) {
          node.error(`create_sms failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error sending create message ${err.message}`;
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
  RED.nodes.registerType('create-sms', create_sms);
}