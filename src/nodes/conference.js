var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  /** conference */
  function conference(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var val = v_resolve(config.maxParticipants, config.maxParticipantsType, this.context(), msg);
      var maxParticipants = /^\d+$/.test(val) ? parseInt(val) : val;

      appendVerb(msg, {
        verb: 'conference',
        name:  v_resolve(config.conference, config.conferenceType, this.context(), msg),
        enterHook: v_resolve(config.enterHook, config.enterHookType, this.context(), msg),
        waitHook: v_resolve(config.waitHook, config.waitHookType, this.context(), msg),
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