var {appendVerb,  new_resolve} = require('./libs')

module.exports = function(RED) {
  /** enqueue */
  function enqueue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg, send, done) {
      appendVerb(msg, {
        verb: 'enqueue',
        name:  await new_resolve(RED, config.queue, config.queueType, node, msg),
        priority:  await new_resolve(RED, config.priority, config.priorityType, node, msg),
        actionHook: await new_resolve(RED, config.actionHook, config.actionHookType, node, msg),
        waitHook: await new_resolve(RED, config.waitHook, config.waitHookType, node, msg)
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('enqueue', enqueue);
}