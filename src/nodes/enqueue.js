var {appendVerb,  new_resolve} = require('./libs')

module.exports = function(RED) {
  /** enqueue */
  function enqueue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      appendVerb(msg, {
        verb: 'enqueue',
        name:  new_resolve(RED, config.queue, config.queueType, node, msg),
        priority:  new_resolve(RED, config.priority, config.priorityType, node, msg),
        actionHook: new_resolve(RED, config.actionHook, config.actionHookType, node, msg),
        waitHook: new_resolve(RED, config.waitHook, config.waitHookType, node, msg)
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('enqueue', enqueue);
}