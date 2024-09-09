var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function listen(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      const obj = {
        verb: 'listen',
        url: await new_resolve(RED, config.url, config.urlType, node, msg),
        actionHook: await new_resolve(RED, config.actionhook, config.actionhookType, node, msg),
        finishOnKey: config.finishonkey,
        mixType: config.mixtype,
        playBeep: config.beep,
        passDtmf: config.passDtmf,
        disableBidirectionalAudio: config.disableBidirectionalAudio,
        sampleRate: config.sampleRate,
      };

      const authUser = await new_resolve(RED, config.authuser, config.authuserType, node, msg);
      const authPass = await new_resolve(RED, config.authpass, config.authpassType, node, msg);
      if (authUser && authPass) {
        obj.wsAuth = {
          username: authUser,
          password: authPass
        };
      }

      if (config.transcriptionhook) {
        const recognizer = {
          vendor: config.transcriptionvendor,
          language: config.recognizerlang,
          interim: config.interim,
          separateRecognitionPerChannel: config.mixtype === 'stereo' && config.separaterecog,
          diarization: config.diarization
        };
        if (recognizer.vendor === 'google') {
          var diarizationMin = await new_resolve(RED, config.diarizationmin, config.diarizationminType, node, msg);
          var diarizationMax = await new_resolve(RED, config.diarizationmax, config.diarizationmaxType, node, msg);
          var hints = await new_resolve(RED, config.transcriptionhints, config.transcriptionhintsType, node, msg);
          var altlangs = await new_resolve(RED, config.recognizeraltlang, config.recognizeraltlangType, node, msg);
          var naics = await new_resolve(RED, config.naics, config.naicsType, node, msg);
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
          var vocab = await new_resolve(RED, config.vocabularyname, config.vocabularynameType, node, msg);
          var vocabFilter = await new_resolve(RED, config.vocabularyfiltername, config.vocabularyfilternameType, node, msg);
          Object.assign(recognizer, {
            vocabularyName: vocab,
            vocabularyFilterName: vocabFilter,
            filterMethod: config.vocabularyfiltermethod
          });
        }
        obj.transcribe = {
          transcriptionHook: await new_resolve(RED, config.transcriptionhook, config.transcriptionhookType, node, msg),
          recognizer
        };
      }
      if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
      if (/^\d+$/.test(config.maxlength)) obj.maxLength = parseInt(config.maxlength);
      if (config.finishonkey.length) obj.finishOnKey = config.finishonkey;

      var data = await new_resolve(RED, config.metadata, config.metadataType, node, msg);
      if (data) obj.metadata = data;

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('listen', listen);
}
