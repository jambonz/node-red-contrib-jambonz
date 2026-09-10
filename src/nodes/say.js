var {appendVerb, new_resolve} = require('./libs')

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
      if (config.vendor != 'default') {
        const synthesizer = {
          vendor: config.vendor,
          language: config.lang,
          voice: config.voice
        };
        if (config.fallbackVendor && config.fallbackVendor != 'default') {
          synthesizer.fallbackVendor = config.fallbackVendor;
          config.fallbackLang ? synthesizer.fallbackLanguage = config.fallbackLang : null;
          config.fallbackVoice ? synthesizer.fallbackVoice = config.fallbackVoice : null;
        }
        Object.assign(obj, {synthesizer});
      }
      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('say', say);
}
