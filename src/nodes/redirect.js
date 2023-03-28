var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  /** redirect */
  function redirect(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      var actionHook = v_resolve(config.hook, config.hookType, this.context(), msg);
      appendVerb(msg, {
        verb: 'redirect',
        actionHook
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('redirect', redirect);
}