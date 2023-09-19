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
        loop: config.loop,
        timeoutSecs: config.timeout ? new_resolve(RED, config.timeout, config.timeoutType, node, msg) : null,
        seekOffset: config.offset ? new_resolve(RED, config.offset, config.offsetType, node, msg) : null,
        actionHook: config.hook ? new_resolve(RED, config.hook, config.hookType, node, msg) : null
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('play', play);
}