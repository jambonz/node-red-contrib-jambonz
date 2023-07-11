var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** conference */
  function conference(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var maxParticipants = new_resolve(RED, config.maxParticipants, config.maxParticipantsType, node, msg)
      appendVerb(msg, {
        verb: 'conference',
        name: new_resolve(RED, config.conference, config.conferenceType, node, msg),
        enterHook: new_resolve(RED, config.enterHook, config.enterHookType, node, msg),
        waitHook: new_resolve(RED, config.waitHook, config.waitHookType, node, msg),
        maxParticipants,
        beep: config.beep,
        startConferenceOnEnter: config.startConferenceOnEnter,
        endOnExit: config.endOnExit,
        joinMuted : config.joinMuted
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('conference', conference);
}