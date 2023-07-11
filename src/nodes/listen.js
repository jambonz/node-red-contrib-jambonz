var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function listen(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      const obj = {
        verb: 'listen',
        url: new_resolve(RED, config.url, config.urlType, node, msg),
        actionHook: new_resolve(RED, config.actionhook, config.actionhookType, node, msg),
        finishOnKey: config.finishonkey,
        mixType: config.mixtype,
        playBeep: config.beep,
        sampleRate: config.sampleRate,
      };

      if (config.transcriptionhook) {
        const recognizer = {
          vendor: config.transcriptionvendor,
          language: config.recognizerlang,
          interim: config.interim,
          separateRecognitionPerChannel: config.mixtype === 'stereo' && config.separaterecog,
          diarization: config.diarization
        };
        if (recognizer.vendor === 'google') {
          var diarizationMin = new_resolve(RED, config.diarizationmin, config.diarizationminType, node, msg);
          var diarizationMax = new_resolve(RED, config.diarizationmax, config.diarizationmaxType, node, msg);
          var hints = new_resolve(RED, config.transcriptionhints, config.transcriptionhintsType, node, msg);
          var altlangs = new_resolve(RED, config.recognizeraltlang, config.recognizeraltlangType, node, msg);
          var naics = new_resolve(RED, config.naics, config.naicsType, node, msg);
          Object.assign(recognizer, {
            profanityFilter: config.profanityfilter,
            hints: hints.length > 0 ?
              hints.split(',').map((w) => w.trim()) :
              [],
            punctuation: config.punctuation,
            enhancedModel: config.useenhanced,
            words: config.words,
            interactionType: config.interactiontype,
          });
          if (recognizer.diarization) {
            if (diarizationMin) recognizer.diarizationMinSpeakers = parseInt(diarizationMin) || 0;
            if (diarizationMax) recognizer.diarizationMaxSpeakers = parseInt(diarizationMax) || 0;
          }
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
        obj.transcribe = {
          transcriptionHook: new_resolve(RED, config.transcriptionhook, config.transcriptionhookType, node, msg),
          recognizer
        };
      }
      if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
      if (/^\d+$/.test(config.maxlength)) obj.maxLength = parseInt(config.maxLength);
      if (config.finishonkey.length) obj.finishOnKey = config.finishonkey;

      var data = new_resolve(RED, config.metadata, config.metadataType, node, msg);
      if (data) obj.metadata = data;

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('listen', listen);
}