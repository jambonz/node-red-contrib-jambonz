var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** redirect */
  function redirect(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg, send, done) {
      var actionHook = await new_resolve(RED, config.hook, config.hookType, node, msg);
      appendVerb(msg, {
        verb: 'redirect',
        actionHook
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('redirect', redirect);
}