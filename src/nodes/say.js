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
        loop: parseInt(node.loop),
        earlyMedia: node.early
      };
      if (config.vendor != 'default') {
        Object.assign(obj, {
          synthesizer: {
            vendor: config.vendor,
            language: config.lang,
            voice: config.voice
          }
        });
      }
      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('say', say);
}