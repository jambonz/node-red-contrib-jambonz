var {appendVerb, new_resolve} = require('./libs')
const assert = require('node:assert/strict');

module.exports = function(RED) {
  function generic(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.verb = config.verb
    node.on('input', async function(msg) {
      if (config.data.length==0) config.data='{}';
      const _data = await new_resolve(RED, config.data, 'mustache', node, msg);
      try {
        const data = JSON.parse(_data)
        assert.ok(typeof(data)=='object')
        appendVerb(msg, {
          ...{verb: node.verb}, 
          ...data
        });
        node.send(msg);
      } catch (error) {
        console.error(error)
        node.error(`Invalid Attributes object: ${_data}`)
      }
      
    });
  }
  RED.nodes.registerType('generic', generic);
}