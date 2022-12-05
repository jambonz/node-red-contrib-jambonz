var {createHash} = require('crypto');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, } = require('./libs');

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
        referTo: config.referTo
      }
      if (typeof(config.headers == 'string')){
        config.headers=JSON.parse(config.headers)
      }
      config.headers ? obj.headers = config.headers : null
      config.referredBy ? obj.referredBy = config.referredBy : null
      config.actionHook ? obj.actionHook = config.actionHook : null
      config.eventHook ? obj.eventHook = config.eventHook : null
      appendVerb(msg, obj)
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:refer', sip_refer);

}