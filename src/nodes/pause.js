var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
    /** pause */
  function pause(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var length = new_resolve(RED, config.len, config.lenType, node, msg);
      appendVerb(msg, {
        verb: 'pause',
        length
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('pause', pause);
}