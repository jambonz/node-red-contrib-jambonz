var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** conference */
  function conference(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      var statusHook = await new_resolve(RED, config.statusHook, config.statusHookType, node, msg);
      appendVerb(msg, {
        verb: 'conference',
        name: await new_resolve(RED, config.conference, config.conferenceType, node, msg),
        enterHook: await new_resolve(RED, config.enterHook, config.enterHookType, node, msg),
        waitHook: await new_resolve(RED, config.waitHook, config.waitHookType, node, msg),
        actionHook: await new_resolve(RED, config.actionHook, config.actionHookType, node, msg),
        statusHook,
        ...(statusHook && { statusEvents: ['start', 'end', 'join', 'leave'] }),
        maxParticipants: await new_resolve(RED, config.maxParticipants, config.maxParticipantsType, node, msg),
        beep: config.beep,
        startConferenceOnEnter: config.startConferenceOnEnter,
        endConferenceOnExit: config.endConferenceOnExit,
        joinMuted: config.joinMuted
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('conference', conference);
}