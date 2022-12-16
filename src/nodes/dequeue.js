var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  /** dequeue */
  function dequeue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      appendVerb(msg, {
        verb: 'dequeue',
        name:  v_resolve(config.queue, config.queueType, this.context(), msg),
        beep: config.beep,
        actionHook: v_resolve(config.actionHook, config.actionHookType, this.context(), msg),
        confirmHook: v_resolve(config.confirmHook, config.confirmHookType, this.context(), msg),
        timeout:  v_resolve(config.timeout, config.timeoutType, this.context(), msg)
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('dequeue', dequeue);
}