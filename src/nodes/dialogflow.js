var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
function dialogflow(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var val = v_resolve(config.inputTimeout, config.inputTimeoutType, this.context(), msg);
      var timeout = /^\d+$/.test(val) ? parseInt(val) : 0;
      var eventHook = v_resolve(config.eventHook, config.eventHookType, this.context(), msg);
      var actionHook = v_resolve(config.actionHook, config.actionHookType, this.context(), msg);
      var welcomeEvent = v_resolve(config.welcomeEvent, config.welcomeEventType, this.context(), msg);
      var environment = v_resolve(config.environment, config.environmentType, this.context(), msg);
      var welcomeEventParams;
      if (welcomeEvent && welcomeEvent.length > 0) {
        welcomeEventParams = v_resolve(config.welcomeEventParams, config.welcomeEventParamsType, this.context(), msg);
      }
      var noInputEvent = v_resolve(config.noInputEvent, config.noInputEventType, this.context(), msg);
      const obj = {
        verb: 'dialogflow',
        credentials:  v_resolve(config.serviceAccountCredentials,
          config.serviceAccountCredentialsType, this.context(), msg),
        project:  v_resolve(config.project, config.projectType, this.context(), msg),
        lang:  config.recognizerlang,
        bargein: config.bargein
      };
      if (welcomeEvent) {
        obj.welcomeEvent = welcomeEvent;
        if (welcomeEventParams) obj.welcomeEventParams = welcomeEventParams;
      }
      if (environment && environment.length > 0) obj.environment = environment;
      if (eventHook && eventHook.length > 0) obj.eventHook = eventHook;
      if (actionHook && actionHook.length > 0) obj.actionHook = actionHook;
      if (timeout) obj.noInputTimeout = timeout;
      if (timeout && noInputEvent) obj.noInputEvent = noInputEvent;
      if (config.prompt === 'tts') {
        obj.tts = {
          vendor: config.vendor,
          language: config.lang,
          voice: config.voice
        };
      }
      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('dialogflow', dialogflow);
}