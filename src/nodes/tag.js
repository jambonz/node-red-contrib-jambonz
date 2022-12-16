var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')


module.exports = function(RED) {
  function tag(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var data = v_resolve(config.data, config.dataType, this.context(), msg, true);
      appendVerb(msg, {
        verb: 'tag',
        data
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('tag', tag);
}