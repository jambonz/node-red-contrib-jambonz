var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  /** enqueue */
  function enqueue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      appendVerb(msg, {
        verb: 'enqueue',
        name:  v_resolve(config.queue, config.queueType, this.context(), msg),
        actionHook: v_resolve(config.actionHook, config.actionHookType, this.context(), msg),
        waitHook: v_resolve(config.waitHook, config.waitHookType, this.context(), msg)
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('enqueue', enqueue);
}