var {appendVerb,  v_text_resolve, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** gather */
  function gather(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {

      // simple properties
      node.log(`config: ${JSON.stringify(config)}`);

      var obj = {verb: 'gather', input: []};
      if (config.actionhook) obj.actionHook = await new_resolve(RED, config.actionhook, config.actionhookType, node, msg)
      if (config.partialresulthook) obj.partialResultHook = await new_resolve(RED, config.partialresulthook, config.partialresulthookType, node, msg)

      // input
      if (config.speechinput) {
        obj.input.push('speech');
        const recognizer = {
          vendor: config.transcriptionvendor,
          language: config.recognizerlang,
          interim: config.interim,
          separateRecognitionPerChannel: config.separaterecog,
          diarization: config.diarization
        };
        if (recognizer.vendor === 'google') {
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
            interactionType: config.interactiontype
          });
          if (recognizer.diarization) {
            var diarizationMin = await new_resolve(RED, config.diarizationmin, config.diarizationminType, node, msg);
            var diarizationMax = await new_resolve(RED, config.diarizationmax, config.diarizationmaxType, node, msg);
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
          if (config.identifychannels) recognizer.identifyChannels = true;
        }
        // recognizer scalar options (all vendors)
        if (/^\d+$/.test(config.asrTimeout)) recognizer.asrTimeout = parseInt(config.asrTimeout);
        if (/^\d+$/.test(config.fastRecognitionTimeout)) recognizer.fastRecognitionTimeout = parseInt(config.fastRecognitionTimeout);
        if (config.asrDtmfTerminationDigit) recognizer.asrDtmfTerminationDigit = config.asrDtmfTerminationDigit;
        obj.recognizer = recognizer;
        if (config.bargein) obj.bargein = config.bargein;
        if (config.listenduringprompt) obj.listenDuringPrompt = config.listenduringprompt;
        if (/^\d+$/.test(config.speechTimeout)) obj.speechTimeout = parseInt(config.speechTimeout);
        if (/^\d+$/.test(config.minBargeinWordCount)) obj.minBargeinWordCount = parseInt(config.minBargeinWordCount);
      }
      if (config.dtmfinput) {
        obj.input.push('digits');
        if (config.finishonkey && config.finishonkey.length) obj.finishOnKey = config.finishonkey;
        if (/^\d+$/.test(config.numdigits)) obj.numDigits = parseInt(config.numdigits);
        if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
        if (/^\d+$/.test(config.mindigits)) obj.minDigits = parseInt(config.mindigits);
        if (/^\d+$/.test(config.maxdigits)) obj.maxDigits = parseInt(config.maxdigits);
        if (/^\d+$/.test(config.interdigittimeout)) obj.interDigitTimeout = parseInt(config.interdigittimeout);
        if (config.dtmfbargein !== undefined) obj.dtmfBargein = config.dtmfbargein;
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
      else obj.play = {url: await new_resolve(RED, config.playurl, config.playurlType, node, msg)};

      // optional nested feature objects (JSON)
      if (config.fillerNoise) {
        const fn = await new_resolve(RED, config.fillerNoise, config.fillerNoiseType, node, msg);
        if (fn && typeof fn === 'object') obj.fillerNoise = fn;
      }
      if (config.vad) {
        const vad = await new_resolve(RED, config.vad, config.vadType, node, msg);
        if (vad && typeof vad === 'object') obj.vad = vad;
      }
      if (config.actionHookDelayAction) {
        const ahda = await new_resolve(RED, config.actionHookDelayAction, config.actionHookDelayActionType, node, msg);
        if (ahda && typeof ahda === 'object') obj.actionHookDelayAction = ahda;
      }

      node.log(`gather: ${JSON.stringify(obj)}`);

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('gather', gather);
}