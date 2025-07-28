var { appendVerb, new_resolve } = require("./libs");

module.exports = function (RED) {
  /** alert */
  function alert(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on("input", async function (msg) {
      appendVerb(msg, {
        verb: "alert",
        message: await new_resolve(
          RED,
          config.message,
          config.messageType,
          node,
          msg
        ),
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType("alert", alert);
};
