var {appendVerb} = require('./libs')

module.exports = function(RED) {
    function answer(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
          var data = {
            verb: 'answer'
          };
          appendVerb(msg, data);
          node.send(msg);
        });
    }
    RED.nodes.registerType('answer', answer);
}