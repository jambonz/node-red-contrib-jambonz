var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
function dialogflow(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      var val = await new_resolve(RED, config.inputTimeout, config.inputTimeoutType, node, msg);
      var timeout = /^\d+$/.test(val) ? parseInt(val) : 0;
      var eventHook = await new_resolve(RED, config.eventHook, config.eventHookType, node, msg);
      var actionHook = await new_resolve(RED, config.actionHook, config.actionHookType, node, msg);
      var welcomeEvent = await new_resolve(RED, config.welcomeEvent, config.welcomeEventType, node, msg);
      var environment = await new_resolve(RED, config.environment, config.environmentType, node, msg);
      var welcomeEventParams;
      if (welcomeEvent && welcomeEvent.length > 0) {
        welcomeEventParams = await new_resolve(RED, config.welcomeEventParams, config.welcomeEventParamsType, node, msg);
      }
      var noInputEvent = await new_resolve(RED, config.noinputEvent, config.noinputEventType, node, msg);
      const obj = {
        verb: 'dialogflow',
        credentials:  await new_resolve(RED, config.serviceAccountCredentials, config.serviceAccountCredentialsType, node, msg),
        project:  await new_resolve(RED, config.project, config.projectType, node, msg),
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

      // model / agent / region (Dialogflow CX & CES)
      if (config.model && config.model !== 'default') obj.model = config.model;
      config.agent ? obj.agent = await new_resolve(RED, config.agent, config.agentType, node, msg) : null;
      config.region ? obj.region = await new_resolve(RED, config.region, config.regionType, node, msg) : null;
      config.thinkingMusic ? obj.thinkingMusic = await new_resolve(RED, config.thinkingMusic, config.thinkingMusicType, node, msg) : null;
      if (config.passDtmf) obj.passDtmfAsTextInput = true;
      if (config.queryInput) {
        const qi = await new_resolve(RED, config.queryInput, config.queryInputType, node, msg);
        if (qi && typeof qi === 'object') obj.queryInput = qi;
      }

      // events to deliver via the eventHook
      if (obj.eventHook) {
        const allEvents = ['intent', 'transcription', 'interim-transcription', 'end-utterance',
          'start-play', 'stop-play', 'session-output', 'interruption', 'end-session', 'go-away', 'tool-calls'];
        let events = [];
        if (config.evtAll) {
          events = allEvents.slice();
        } else {
          if (config.evtIntent) events.push('intent');
          if (config.evtTranscript) events.push('transcription');
          if (config.evtInterimTranscript) events.push('interim-transcription');
          if (config.evtEndUtterance) events.push('end-utterance');
          if (config.evtStartPlay) events.push('start-play');
          if (config.evtEndPlay) events.push('stop-play');
        }
        if (events.length) obj.events = events;
      }

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