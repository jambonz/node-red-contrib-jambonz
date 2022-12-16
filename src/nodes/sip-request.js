var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs');
const { type } = require('os');
const { ConfigurationOptions } = require('aws-sdk');

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
      if (typeof(config.headers == 'string')){
        config.headers=JSON.parse(config.headers)
      }
      config.headers ? obj.headers = config.headers : null
      config.body ? obj.body = config.body : null
      config.actionHook ? obj.actionHook = config.actionHook : null
      appendVerb(msg, obj)
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:request', sip_request);

}