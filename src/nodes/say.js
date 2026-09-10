var {appendVerb, new_resolve, resolveSpeechObject} = require('./libs')

module.exports = function(RED) {
  /** say */
  function say(config) {
    RED.nodes.createNode(this, config);
    this.text = config.text;
    this.early = config.early;
    this.loop = config.loop;
    var node = this;

    node.on('input', async function(msg) {
      const text = await new_resolve(RED, config.text, 'mustache', node, msg);
      var obj = {
        verb: 'say',
        text,
        loop: node.loop === 'forever' ? 'forever' : parseInt(node.loop),
        earlyMedia: node.early
      };
      if (config.instructions) obj.instructions = await new_resolve(RED, config.instructions, config.instructionsType, node, msg);
      if (config.stream) obj.stream = true;
      if (config.disableTtsCache) obj.disableTtsCache = true;
      if (config.closeStreamOnEmpty) obj.closeStreamOnEmpty = true;

      // synthesizer: canonical object from the reusable speech component (resolving any
      // msg/flow references), with a legacy fallback for flows saved before the component existed.
      let synthesizer = await resolveSpeechObject(RED, config.synthesizer, node, msg);
      if (!synthesizer && config.vendor && config.vendor !== 'default') {
        synthesizer = {vendor: config.vendor};
        if (config.lang && config.lang !== 'default') synthesizer.language = config.lang;
        if (config.voice && config.voice !== 'default') synthesizer.voice = config.voice;
        if (config.fallbackVendor && config.fallbackVendor !== 'default') {
          synthesizer.fallbackVendor = config.fallbackVendor;
          if (config.fallbackLang) synthesizer.fallbackLanguage = config.fallbackLang;
          if (config.fallbackVoice) synthesizer.fallbackVoice = config.fallbackVoice;
        }
      }
      if (synthesizer && synthesizer.vendor) obj.synthesizer = synthesizer;

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('say', say);
}
