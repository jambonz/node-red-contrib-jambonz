var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** conference */
  function conference(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      var statusHook = await new_resolve(RED, config.statusHook, config.statusHookType, node, msg);
      const obj = {
        verb: 'conference',
        name: await new_resolve(RED, config.conference, config.conferenceType, node, msg),
        enterHook: await new_resolve(RED, config.enterHook, config.enterHookType, node, msg),
        waitHook: await new_resolve(RED, config.waitHook, config.waitHookType, node, msg),
        actionHook: await new_resolve(RED, config.actionHook, config.actionHookType, node, msg),
        statusHook,
        maxParticipants: await new_resolve(RED, config.maxParticipants, config.maxParticipantsType, node, msg),
        beep: config.beep,
        startConferenceOnEnter: config.startConferenceOnEnter,
        endConferenceOnExit: config.endConferenceOnExit,
        joinMuted: config.joinMuted,
        ...(config.distributeDtmf && {'distributeDtmf': true})
      };

      if (statusHook) {
        const custom = await new_resolve(RED, config.statusEvents, config.statusEventsType, node, msg);
        obj.statusEvents = (custom && custom.length) ?
          custom.split(',').map((e) => e.trim()).filter((e) => e.length) :
          ['start', 'end', 'join', 'leave'];
      }

      config.memberTag ? obj.memberTag = await new_resolve(RED, config.memberTag, config.memberTagType, node, msg) : null;
      config.speakOnlyTo ? obj.speakOnlyTo = await new_resolve(RED, config.speakOnlyTo, config.speakOnlyToType, node, msg) : null;
      if (/^\d+$/.test(config.endConferenceDuration)) obj.endConferenceDuration = parseInt(config.endConferenceDuration);

      if (config.record) {
        const record = await new_resolve(RED, config.record, config.recordType, node, msg);
        if (record && typeof record === 'object') obj.record = record;
      }
      if (config.listen) {
        const listen = await new_resolve(RED, config.listen, config.listenType, node, msg);
        if (listen && typeof listen === 'object') obj.listen = listen;
      }
      if (config.stream) {
        const stream = await new_resolve(RED, config.stream, config.streamType, node, msg);
        if (stream && typeof stream === 'object') obj.stream = stream;
      }

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('conference', conference);
}
