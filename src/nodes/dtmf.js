var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function dtmf(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      appendVerb(msg,  {
        verb: 'dtmf',
        dtmf: new_resolve(RED, config.dtmf, config.dtmfType, node, msg),
        duration: new_resolve(RED, config.duration, config.durationType, node, msg),
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('dtmf', dtmf);
}