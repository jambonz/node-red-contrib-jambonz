var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function tag(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      var data = await new_resolve(RED, config.data, config.dataType, node, msg);
      if (typeof(data) != 'object') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          console.log('Failed to parse data as JSON: ', data)
          return node.send(msg);
        }
      } else {
        data = Object.assign({}, data);
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