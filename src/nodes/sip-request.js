var {appendVerb, new_resolve} = require('./libs');

module.exports = function(RED) {
  /** sip:decline */
  function sip_request(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      obj = {
        verb: 'sip:request',
        method: config.method
      }
      Object.keys(config).forEach(function(key, index) {
        if (config[key] == ''){
          config[key] = false
        };
      });
      config.headers ? obj.headers = new_resolve(RED, config.headers, config.headersType, node, msg) : null
      if (typeof obj.headers == 'string'){
        obj.headers = JSON.parse(obj.headers)
      }
      config.body ? obj.body = new_resolve(RED, config.body, config.bodyType, node, msg) : null
      config.actionHook ? obj.actionHook = new_resolve(RED, config.actionHook, config.actionHookType, node, msg) : null
      appendVerb(msg, obj)
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:request', sip_request);
}