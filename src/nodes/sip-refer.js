var {appendVerb, new_resolve} = require('./libs');

module.exports = function(RED) {
  function sip_refer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      Object.keys(config).forEach(function(key, index) {
        if (config[key] == ''){
          config[key] = false
        };
      });
      obj = {
        verb: 'sip:refer',
        referTo: await new_resolve(RED, config.referTo, config.referToType, node, msg)
      }
      config.headers ? obj.headers = await new_resolve(RED, config.headers, config.headersType, node, msg) : null
      if (typeof obj.headers == 'string'){
        obj.headers = JSON.parse(obj.headers)
      }
      config.referredBy ? obj.referredBy = await new_resolve(RED, config.referredBy, config.referredByType, node, msg) : null
      config.actionHook ? obj.actionHook = await new_resolve(RED, config.actionHook, config.actionHookType, node, msg) : null
      config.eventHook ? obj.eventHook = await new_resolve(RED, config.eventHook, config.eventHookType, node, msg) : null
      appendVerb(msg, obj)
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:refer', sip_refer);
}