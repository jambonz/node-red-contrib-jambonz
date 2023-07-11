var { appendVerb,  new_resolve } = require("./libs");

module.exports = function (RED) {
  function message(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on("input", function (msg, send, done) {
      var from = new_resolve(RED, config.from, config.fromType, node, msg);
      var to =new_resolve(RED, config.to, config.toType, node, msg);
      var text = new_resolve(RED, config.text, config.textType, node, msg);
      var provider = new_resolve(RED, config.provider, config.providerType, node, msg);
      if ((!provider || 0 === provider.length) && msg.sms.provider) {
        provider = msg.sms.provider;
      }

      appendVerb(msg, {
        verb: "message",
        from,
        to,
        text,
        provider,
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType("message", message);
};
