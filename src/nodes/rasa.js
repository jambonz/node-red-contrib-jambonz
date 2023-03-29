var {appendVerb} = require('./libs')

module.exports = function(RED) {
    function rasa(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
          obj = {verb: 'rasa'}
          obj.url = config.url
          config.prompt != '' ? obj.prompt = config.prompt : null
          config.eventHook != '' ? obj.eventHook = config.eventHook : null
          config.actionHook != '' ? obj.actionHook = config.actionHook : null
          appendVerb(msg, obj);
          node.send(msg);
        });
      }
      RED.nodes.registerType('rasa', rasa);
}