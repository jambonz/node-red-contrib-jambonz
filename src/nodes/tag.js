var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function tag(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      var data = await new_resolve(RED, config.data, config.dataType, node, msg);
      if (typeof(data) != 'object'){
        data = JSON.parse(data)
      }
      appendVerb(msg, {
        verb: 'tag',
        data
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('tag', tag);
}