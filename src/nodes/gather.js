var {appendVerb, v_resolve, v_text_resolve} = require('./libs')

module.exports = function(RED) {
  /** gather */
  function gather(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {

      // simple properties
      node.log(`config: ${JSON.stringify(config)}`);

      var obj = {verb: 'gather', input: []};
      if (config.actionhook) obj.actionHook = config.actionhook;

      // input
      if (config.speechinput) {
        obj.input.push('speech');
        const recognizer = {
          vendor: config.transcriptionvendor,
          language: config.recognizerlang
        };
        if (recognizer.vendor === 'google') {
          var hints = v_resolve(config.transcriptionhints, config.transcriptionhintsType, this.context(), msg);
          var altlangs = v_resolve(config.recognizeraltlang, config.recognizeraltlangType, this.context(), msg);
          var naics = v_resolve(config.naics, config.naicsType, this.context(), msg);
          Object.assign(recognizer, {
            profanityFilter: config.profanityfilter,
            hints: hints.length > 0 ?
              hints.split(',').map((w) => w.trim()) :
              []
          });
          if (naics) recognizer.naicsCode = parseInt(naics) || 0;
          if (altlangs) {
            recognizer.altLanguages = altlangs.split(',').map((e) => e.trim());
          }
        }
        else if (recognizer.vendor === 'aws') {
          var vocab = v_resolve(config.vocabularyname, config.vocabularynameType, this.context(), msg);
          var vocabFilter = v_resolve(config.vocabularyfiltername, config.vocabularynameType, this.context(), msg);
          Object.assign(recognizer, {
            vocabularyName: vocab,
            vocabularyFilterName: vocabFilter,
            filterMethod: config.vocabularyfiltermethod
          });
        }
        obj.recognizer = recognizer;
      }
      if (config.dtmfinput) {
        obj.input.push('digits');
        if (config.finishonkey && config.finishonkey.length) obj.finishOnKey = config.finishonkey;
        if (/^\d+$/.test(config.numdigits)) obj.numDigits = parseInt(config.numdigits);
        if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
      }

      // prompt
      if (config.prompttype === 'say') {
        obj.say = {text: v_text_resolve(node, config.text, this.context(), msg)};
        if (['aws', 'google'].includes(config.vendor)) {
          Object.assign(obj.say, {
            synthesizer: {
              vendor: config.vendor,
              language: config.lang,
              voice: config.voice
            }
          });
        }
      }
      else obj.play = {url: v_resolve(config.playurl, config.playurlType, this.context(), msg)};

      node.log(`gather: ${JSON.stringify(obj)}`);

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('gather', gather);
}