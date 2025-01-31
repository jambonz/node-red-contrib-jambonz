var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function generic(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.verb = config.verb
    node.on('input', async function(msg) {
      let data = await new_resolve(RED, config.data, config.dataType, node, msg);
      appendVerb(msg, {
        ...{verb: node.verb}, 
        ...data
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('generic', generic);
}