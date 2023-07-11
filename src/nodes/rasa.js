var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
    function rasa(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
          obj = {verb: 'rasa'}
          obj.url = new_resolve(RED, config.url, config.urlType, node, msg);
          obj.prompt = new_resolve(RED, config.prompt, config.promptType, node, msg);
          obj.eventHook = new_resolve(RED, config.eventHook, config.eventHookType, node, msg);
          obj.actionHook = new_resolve(RED, config.actionHook, config.actionHookType, node, msg);
          appendVerb(msg, obj);
          node.send(msg);
        });
      }
      RED.nodes.registerType('rasa', rasa);
}