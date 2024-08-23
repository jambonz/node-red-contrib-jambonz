var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
    function cfg(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', async function(msg) {
          obj = { verb: 'config' }
          if (config.tts){
            Object.assign(obj, {
              synthesizer: {
                vendor: config.vendor,
                language: config.lang,
                voice: config.voice
              }
            });
          }
          if (config.speechinput){
            Object.assign(obj, {
              recognizer: {
                vendor: config.transcriptionvendor,
                language: config.recognizerlang
              }
            })
            if (config.transcriptionvendor == 'google'){
              obj.recognizer.hints = await new_resolve(RED, config.transcriptionhints, config.transcriptionhintsType, node, msg)
              obj.recognizer.altLanguages = [await new_resolve(RED, config.altLanguages, config.altLanguagesType, node, msg)]
              obj.recognizer.naicsCode = await new_resolve(RED, config.naics, config.naicsType, node, msg)
            }
            if (config.transcriptionvendor == 'aws'){
              obj.recognizer.vocabularyName = config.vocabularyname
              obj.recognizer.vocabularyFilterName = config.vocabularyfiltername
              obj.recognizer.filterMethod = config.filtermethod
              obj.recognizer.identifyChannels = config.identifyChannels
            }
          }
          if (config.bargeIn){
            obj.bargeIn = {}
            config.bargeIn_enable != '' ? obj.bargeIn.enable = config.bargeIn_enable : null
            config.bargeIn_actionHook != '' ? obj.bargeIn.actionHook = await new_resolve(RED, config.bargeIn_actionHook, config.bargeIn_actionHookType, node, msg) : null
            config.bargeIn_input != '' ? obj.bargeIn.input = config.bargeIn_input.split(',') : null
            config.bargeIn_finishOnKey != '' ? obj.bargeIn.finishOnKey = await new_resolve(RED, config.bargeIn_finishOnKey, config.bargeIn_finishOnKeyType, node, msg) : null
            config.bargeIn_numDigits != '' ? obj.bargeIn.numDigits = await new_resolve(RED, config.bargeIn_numDigits, config.bargeIn_numDigitsType, node, msg) : null
            config.bargeIn_minDigits != '' ? obj.bargeIn.minDigits = await new_resolve(RED, config.bargeIn_minDigits, config.bargeIn_minDigitsType, node, msg) : null
            config.bargeIn_maxDigits != '' ? obj.bargeIn.maxDigits = await new_resolve(RED, config.bargeIn_maxDigits, config.bargeIn_maxDigitsType, node, msg) : null
            config.bargeIn_interDigitTimeout != '' ? obj.bargeIn.interDigitTimeout = await new_resolve(RED, config.bargeIn_interDigitTimeout, config.bargeIn_interDigitTimeoutType, node, msg) : null
          }

          if (config.amd){
            obj.amd = {timers : {}}
            config.amd_actionHook != '' ? obj.amd.actionHook = await new_resolve(RED, config.amd_actionHook, config.amd_actionHookType, node, msg) : null
            config.amd_thresholdWordCount != '' ? obj.amd.thresholdWordCount = await new_resolve(RED, config.amd_thresholdWordCount, config.amd_thresholdWordCountType, node, msg) : null
            config.amd_timers_noSpeechTimeoutMs != '' ? obj.amd.timers.noSpeechTimeoutMs = await new_resolve(RED, config.amd_timers_noSpeechTimeoutMs, config.amd_timers_noSpeechTimeoutMsType, node, msg) : null
            config.amd_timers_decisionTimeoutMs != '' ? obj.amd.timers.decisionTimeoutMs = await new_resolve(RED, config.amd_timers_decisionTimeoutMs, config.amd_timers_decisionTimeoutMsType, node, msg) : null
            config.amd_timers_toneTimeoutMs != '' ?	 obj.amd.timers.toneTimeoutMs = await new_resolve(RED, config.amd_timers_toneTimeoutMs, config.amd_timers_toneTimeoutMsType, node, msg) : null
            config.amd_timers_greetingCompletionTimeoutMs != '' ? obj.amd.timers.greetingCompletionTimeoutMs = await new_resolve(RED, config.amd_timers_greetingCompletionTimeoutMs, config.amd_timers_greetingCompletionTimeoutMsType, node, msg) : null
          }

          if (config.record){
            obj.record = {}
            config.record_action != '' ? obj.record.action = config.record_action : null //TODO if multiple, split into array
            config.record_siprecServerURL != '' ? obj.record.siprecServerURL = await new_resolve(RED, config.record_siprecServerURL, config.record_siprecServerURLType, node, msg) : null
            config.record_recordingID != '' ? obj.record.recordingID = await new_resolve(RED, config.record_recordingID, config.record_recordingIDType, node, msg) : null
          }

          if (config.listenRequest) {
            obj.listen = {}
            const authUser = await new_resolve(RED, config.listenAuthUser, config.listenAuthUserType, node, msg);
            const authPass = await new_resolve(RED, config.listenAuthPass, config.listenAuthPassType, node, msg);
            if (authUser && authPass) {
              obj.listen.wsAuth = {
                username: authUser,
                password: authPass
              };
            }
            obj.listen.enable = config.listenEnabled;
            obj.listen.sampleRate = +config.listenSampleRate;
            obj.listen.mixType = config.listenMixType;
            config.url != '' ? obj.listen.url = await new_resolve(RED, config.listenUrl, config.listenUrlType, node, msg) : null;
            config.listenMetadata != '' ? obj.listen.metadata = await new_resolve(RED, config.listenMetadata, config.listenMetadataType, node, msg) : null;
            if (!Object.keys(obj.listen.metadata).length) {
              delete obj.listen.metadata;
            }
          }

          if (config.sipRequest) {
            config.sipRequestWithinDialogHook != '' ? obj.sipRequestWithinDialogHook = await new_resolve(RED, config.sipRequestWithinDialogHook, config.sipRequestWithinDialogHookType, node, msg) : null;
          }

          if (config.onHold) {
            config.onHoldMusic != '' ? obj.onHoldMusic = await new_resolve(RED, config.onHoldMusic, config.onHoldMusicType, node, msg) : null;
          }

          if (config.boostAudioSignal) {
            config.boostAudioSignal != '' ? obj.boostAudioSignal = await new_resolve(RED, config.boostAudioSignalLevel, config.boostAudioSignalLevelType, node, msg) : null;
          }
          appendVerb(msg,  obj);
          node.send(msg);
        });
      }
    RED.nodes.registerType('cfg', cfg);
}