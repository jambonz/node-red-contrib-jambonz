var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')


module.exports = function(RED) {
    /** pause */
  function pause(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var val = v_resolve(config.len, config.lenType, this.context(), msg);
      var length = /^\d+$/.test(val) ? parseInt(val) : parseFloat(val);
      appendVerb(msg, {
        verb: 'pause',
        length
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('pause', pause);

}