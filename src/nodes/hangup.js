var {appendVerb} = require('./libs')

module.exports = function(RED) {
    function hangup(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
          appendVerb(msg, {
            verb: 'hangup'
          });
          node.send(msg);
        });
    }
    RED.nodes.registerType('hangup', hangup);
}