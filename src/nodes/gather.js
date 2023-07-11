var {appendVerb,  v_text_resolve, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** gather */
  function gather(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {

      // simple properties
      node.log(`config: ${JSON.stringify(config)}`);

      var obj = {verb: 'gather', input: []};
      if (config.actionhook) obj.actionHook = new_resolve(RED, config.actionHook, config.actionHookType, node, msg)

      // input
      if (config.speechinput) {
        obj.input.push('speech');
        const recognizer = {
          vendor: config.transcriptionvendor,
          language: config.recognizerlang
        };
        if (recognizer.vendor === 'google') {
          var hints = new_resolve(RED, config.transcriptionhints, config.transcriptionhintsType, node, msg);
          var altlangs = new_resolve(RED, config.recognizeraltlang, config.recognizeraltlangType, node, msg);
          var naics = new_resolve(RED, config.naics, config.naicsType, node, msg);
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
          var vocab = new_resolve(RED, config.vocabularyname, config.vocabularynameType, node, msg);
          var vocabFilter = new_resolve(RED, config.vocabularyfiltername, config.vocabularyfilternameType, node, msg);
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
      else obj.play = {url: new_resolve(RED, config.playurl, config.playurlType, node, msg)};

      node.log(`gather: ${JSON.stringify(obj)}`);

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('gather', gather);
}