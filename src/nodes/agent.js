var {appendVerb, new_resolve, resolveSpeechObject} = require('./libs');

module.exports = function(RED) {
  /** agent - jambonz-native LLM voice agent (STT + LLM + TTS) */
  function agent(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments); };
      try {
        const obj = { verb: 'agent' };

        config.llm ? obj.llm = await new_resolve(RED, config.llm, config.llmType, node, msg) : null;
        const stt = await resolveSpeechObject(RED, config.stt, node, msg);
        if (stt) obj.stt = stt;
        const tts = await resolveSpeechObject(RED, config.tts, node, msg);
        if (tts) obj.tts = tts;
        config.bargeIn ? obj.bargeIn = await new_resolve(RED, config.bargeIn, config.bargeInType, node, msg) : null;
        config.turnDetection ? obj.turnDetection =
          await new_resolve(RED, config.turnDetection, config.turnDetectionType, node, msg) : null;
        config.noiseIsolation ? obj.noiseIsolation =
          await new_resolve(RED, config.noiseIsolation, config.noiseIsolationType, node, msg) : null;
        config.handoff ? obj.handoff = await new_resolve(RED, config.handoff, config.handoffType, node, msg) : null;
        config.mcpServers ? obj.mcpServers =
          await new_resolve(RED, config.mcpServers, config.mcpServersType, node, msg) : null;
        config.languageConfig ? obj.languageConfig =
          await new_resolve(RED, config.languageConfig, config.languageConfigType, node, msg) : null;

        config.actionHook ? obj.actionHook = await new_resolve(RED, config.actionHook, config.actionHookType, node, msg) : null;
        config.eventHook ? obj.eventHook = await new_resolve(RED, config.eventHook, config.eventHookType, node, msg) : null;
        config.toolHook ? obj.toolHook = await new_resolve(RED, config.toolHook, config.toolHookType, node, msg) : null;

        if (config.autoLockLanguage && config.autoLockLanguage !== 'default') {
          obj.autoLockLanguage = config.autoLockLanguage === 'always' ? 'always' : true;
        }
        config.noResponseTimeout ? obj.noResponseTimeout =
          parseInt(await new_resolve(RED, config.noResponseTimeout, config.noResponseTimeoutType, node, msg)) : null;
        if (config.greeting) obj.greeting = true;
        if (config.earlyGeneration) obj.earlyGeneration = true;
        if (config.toolFiller) obj.toolFiller = true;

        appendVerb(msg, obj);
        send(msg);
        if (done) done();
      } catch (err) {
        if (done) done(err.message);
        else node.error(`Error building agent verb: ${err.message}`, msg);
      }
    });
  }
  RED.nodes.registerType('agent', agent);
};
