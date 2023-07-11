var {appendVerb, new_resolve} = require('./libs');

module.exports = function(RED) {
  function sip_refer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      Object.keys(config).forEach(function(key, index) {
        if (config[key] == ''){
          config[key] = false
        };
      });
      obj = {
        verb: 'sip:refer',
        referTo: new_resolve(RED, config.referTo, config.referToType, node, msg)
      }
      if (typeof(config.headers == 'string')){
        config.headers=JSON.parse(config.headers)
      }
      config.headers ? obj.headers = new_resolve(RED, config.headers, config.headersType, node, msg) : null
      config.referredBy ? obj.referredBy = new_resolve(RED, config.referredBy, config.referredByType, node, msg) : null
      config.actionHook ? obj.actionHook = new_resolve(RED, config.actionHook, config.actionHookType, node, msg) : null
      config.eventHook ? obj.eventHook = new_resolve(RED, config.eventHook, config.eventHookType, node, msg) : null
      appendVerb(msg, obj)
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:refer', sip_refer);
}