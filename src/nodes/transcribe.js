var {appendVerb, new_resolve} = require('./libs');

module.exports = function(RED) {
  /** transcribe - real-time transcription of the call, posted to a webhook */
  function transcribe(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments); };
      try {
        const obj = { verb: 'transcribe' };

        obj.transcriptionHook = await new_resolve(RED, config.transcriptionHook, config.transcriptionHookType, node, msg);
        config.translationHook ? obj.translationHook =
          await new_resolve(RED, config.translationHook, config.translationHookType, node, msg) : null;

        const recognizer = {};
        if (config.vendor && config.vendor !== 'default') recognizer.vendor = config.vendor;
        if (config.language && config.language !== 'default') recognizer.language = config.language;
        if (config.recognizerOptions) {
          const opts = await new_resolve(RED, config.recognizerOptions, config.recognizerOptionsType, node, msg);
          if (opts && typeof opts === 'object') Object.assign(recognizer, opts);
        }
        if (Object.keys(recognizer).length) obj.recognizer = recognizer;

        if (config.channel && config.channel !== 'default') obj.channel = parseInt(config.channel);
        if (config.earlyMedia) obj.earlyMedia = true;

        appendVerb(msg, obj);
        send(msg);
        if (done) done();
      } catch (err) {
        if (done) done(err.message);
        else node.error(`Error building transcribe verb: ${err.message}`, msg);
      }
    });
  }
  RED.nodes.registerType('transcribe', transcribe);
};
