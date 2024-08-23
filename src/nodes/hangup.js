var {appendVerb} = require('./libs')

module.exports = function(RED) {
    function hangup(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', async function(msg) {
          var data = {
            verb: 'hangup'
          };
          // headers
          var headers = {};
          if (config.headers) {
            config.headers.forEach(function(h) {
              if (h.h.length && h.v.length) headers[h.h] = h.v;
            });
          }
          Object.assign(data, {headers});
          appendVerb(msg, data);
          node.log(`hangup jambonz: ${JSON.stringify(msg.jambonz)}`);
          node.send(msg);
        });
    }
    RED.nodes.registerType('hangup', hangup);
}