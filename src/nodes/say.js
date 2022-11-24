var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_text_resolve} = require('./libs')

module.exports = function(RED) {
  /** say */
  function say(config) {
    RED.nodes.createNode(this, config);
    this.text = config.text;
    this.early = config.early;
    this.loop = config.loop;
    var node = this;

    node.on('input', function(msg) {
      node.log(`say config: ${JSON.stringify(config)}, msg.call: ${JSON.stringify(msg.call)}`);
      const text = v_text_resolve(node, this.text, this.context(), msg);
      // jambonz say verb
      var obj = {
        verb: 'say',
        text,
        loop: parseInt(node.loop),
        earlyMedia: node.early
      };
      if (['aws', 'google'].includes(node.vendor)) {
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