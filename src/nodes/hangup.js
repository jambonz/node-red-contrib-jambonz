var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb} = require('./libs')


module.exports = function(RED) {
    function hangup(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
          appendVerb(msg, {
            verb: 'hangup'
          });
          node.send(msg);
        });
      }
      RED.nodes.registerType('hangup', hangup);
}