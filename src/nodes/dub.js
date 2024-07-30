var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** dub */
  function dub(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function(msg) {
      var obj = {
        verb: 'dub',
        action: config.action,
        track: new_resolve(RED, config.track, config.trackType, node, msg),
        play: new_resolve(RED, config.play, config.playType, node, msg),
        say: new_resolve(RED, config.say, config.sayType, node, msg),
        loop: config.loop,
        gain: config.gain
      };
      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('dub', dub);
}