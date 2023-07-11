var {appendVerb,  new_resolve} = require('./libs')

module.exports = function(RED) {
  /** dequeue */
  function dequeue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      const timeout = new_resolve(RED, config.timeout, config.timeoutType, node, msg);
      appendVerb(msg, {
        verb: 'dequeue',
        name:  new_resolve(RED, config.queue, config.queueType, node, msg),
        callSid: new_resolve(RED, config.callSid, config.callSidType, node, msg),
        beep: config.beep,
        actionHook: new_resolve(RED, config.actionHook, config.actionHookType, node, msg),
        confirmHook: new_resolve(RED, config.confirmHook, config.confirmHookType, node, msg),
        timeout: (/^\d+$/.test(timeout)) ? parseInt(timeout) : null,
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('dequeue', dequeue);
}