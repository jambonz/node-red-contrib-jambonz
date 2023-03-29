var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  function listen(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      const obj = {
        verb: 'listen',
        url: v_resolve(config.url, config.urlType, this.context(), msg),
        actionHook: v_resolve(config.actionhook, config.actionhookType, this.context(), msg),
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
          var diarizationMin = v_resolve(config.diarizationmin, config.diarizationminType, this.context(), msg);
          var diarizationMax = v_resolve(config.diarizationmax, config.diarizationmaxType, this.context(), msg);
          var hints = v_resolve(config.transcriptionhints, config.transcriptionhintsType, this.context(), msg);
          var altlangs = v_resolve(config.recognizeraltlang, config.recognizeraltlangType, this.context(), msg);
          var naics = v_resolve(config.naics, config.naicsType, this.context(), msg);
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
          var vocab = v_resolve(config.vocabularyname, config.vocabularynameType, this.context(), msg);
          var vocabFilter = v_resolve(config.vocabularyfiltername, config.vocabularynameType, this.context(), msg);
          Object.assign(recognizer, {
            vocabularyName: vocab,
            vocabularyFilterName: vocabFilter,
            filterMethod: config.vocabularyfiltermethod
          });
        }
        obj.transcribe = {
          transcriptionHook: v_resolve(config.transcriptionhook, config.transcriptionhookType, this.context(), msg),
          recognizer
        };
      }
      if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
      if (/^\d+$/.test(config.maxlength)) obj.maxLength = parseInt(config.maxLength);
      if (config.finishonkey.length) obj.finishOnKey = config.finishonkey;

      var data = v_resolve(config.metadata, config.metadataType, this.context(), msg, true);
      if (data) obj.metadata = data;

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('listen', listen);
}