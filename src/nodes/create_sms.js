var {doCreateMessage, new_resolve} = require('./libs')

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

      var from = new_resolve(RED, config.from, config.fromType, node, msg)
      var to = new_resolve(RED, config.to, config.toType, node, msg)
      var text = new_resolve(RED, config.text, config.textType, node, msg);
      var provider = new_resolve(RED, config.provider, config.providerType, node, msg)

      const opts = {
        from,
        to,
        text,
        provider
      };
      try {
        node.log(`sending create message ${JSON.stringify(opts)}`);
        const res = await doCreateMessage(url, accountSid, apiToken, opts);
        msg.statusCode = 201;
        msg.messageSid = res.sid;
        msg.providerResponse = res.providerResponse;
      } catch (err) {
        if (err.statusCode) {
          node.log(JSON.stringify(err));
          try {
            const responseBody = await err.json();
            node.error(`create_sms failed with ${err.statusCode}. Response ${JSON.stringify(responseBody)}`);
          } catch (e) {
            node.error(`create_sms failed with ${err.statusCode}`);
          }
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