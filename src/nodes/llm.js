var {appendVerb, new_resolve} = require('./libs');

module.exports = function(RED) {
  /** llm - connect the call to a real-time speech-to-speech LLM engine */
  function llm(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments); };
      try {
        const obj = { verb: 'llm' };

        obj.vendor = config.vendor;
        config.model ? obj.model = await new_resolve(RED, config.model, config.modelType, node, msg) : null;
        config.auth ? obj.auth = await new_resolve(RED, config.auth, config.authType, node, msg) : null;
        config.connectOptions ? obj.connectOptions =
          await new_resolve(RED, config.connectOptions, config.connectOptionsType, node, msg) : null;
        config.llmOptions ? obj.llmOptions =
          await new_resolve(RED, config.llmOptions, config.llmOptionsType, node, msg) : null;
        config.mcpServers ? obj.mcpServers =
          await new_resolve(RED, config.mcpServers, config.mcpServersType, node, msg) : null;

        config.actionHook ? obj.actionHook = await new_resolve(RED, config.actionHook, config.actionHookType, node, msg) : null;
        config.eventHook ? obj.eventHook = await new_resolve(RED, config.eventHook, config.eventHookType, node, msg) : null;
        config.toolHook ? obj.toolHook = await new_resolve(RED, config.toolHook, config.toolHookType, node, msg) : null;
        config.handoff ? obj.handoff = await new_resolve(RED, config.handoff, config.handoffType, node, msg) : null;

        if (config.events) obj.events = config.events.split(',').map((s) => s.trim()).filter((s) => s.length);
        config.responseTimeoutMs ? obj.responseTimeoutMs =
          parseInt(await new_resolve(RED, config.responseTimeoutMs, config.responseTimeoutMsType, node, msg)) : null;
        if (config.cancelOnResponseTimeout) obj.cancelOnResponseTimeout = true;
        if (config.cancelOnBargeIn) obj.cancelOnBargeIn = true;

        appendVerb(msg, obj);
        send(msg);
        if (done) done();
      } catch (err) {
        if (done) done(err.message);
        else node.error(`Error building llm verb: ${err.message}`, msg);
      }
    });
  }
  RED.nodes.registerType('llm', llm);
};
