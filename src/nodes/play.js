var {appendVerb,  new_resolve} = require('./libs')

module.exports = function(RED) {
  function play(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      appendVerb(msg,  {
        verb: 'play',
        url: new_resolve(RED, config.url, config.urlType, node, msg),
        earlyMedia: config.early,
        loop: config.loop
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('play', play);
}