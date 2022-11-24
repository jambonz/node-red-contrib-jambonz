var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')


module.exports = function(RED) {
     function message(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg, send, done) {
          var from = v_resolve(config.from, config.fromType, this.context(), msg);
          var to = v_resolve(config.to, config.toType, this.context(), msg);
          var text = v_resolve(config.text, config.textType, this.context(), msg);
          var provider = v_resolve(config.provider, config.providerType, this.context(), msg);
          if ((!provider || 0 === provider.length) && msg.sms.provider) {
            provider = msg.sms.provider;
          }
    
          appendVerb(msg, {
            verb: 'message',
            from,
            to,
            text,
            provider
          });
          node.send(msg);
        });
      }
      RED.nodes.registerType('message', message);
}