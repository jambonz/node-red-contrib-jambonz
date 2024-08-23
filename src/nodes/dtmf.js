var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function dtmf(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      appendVerb(msg,  {
        verb: 'dtmf',
        dtmf: await new_resolve(RED, config.dtmf, config.dtmfType, node, msg),
        duration: await new_resolve(RED, config.duration, config.durationType, node, msg),
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('dtmf', dtmf);
}