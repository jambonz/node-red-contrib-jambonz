var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  /** dequeue */
  function dequeue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      const timeout = v_resolve(config.timeout, config.timeoutType, this.context(), msg);
      appendVerb(msg, {
        verb: 'dequeue',
        name:  v_resolve(config.queue, config.queueType, this.context(), msg),
        callSid: v_resolve(config.callSid, config.callSidType, this.context(), msg),
        beep: config.beep,
        actionHook: v_resolve(config.actionHook, config.actionHookType, this.context(), msg),
        confirmHook: v_resolve(config.confirmHook, config.confirmHookType, this.context(), msg),
        timeout: (/^\d+$/.test(timeout)) ? parseInt(timeout) : null,
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('dequeue', dequeue);
}