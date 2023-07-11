var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
    function cfg(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
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
              obj.recognizer.hints = new_resolve(RED, config.transcriptionhints, config.transcriptionhintsType, node, msg)
              obj.recognizer.altLanguages = [new_resolve(RED, config.altLanguages, config.altLanguagesType, node, msg)]
              obj.recognizer.naicsCode = new_resolve(RED, config.naics, config.naicsType, node, msg)
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
            config.bargeIn_actionHook != '' ? obj.bargeIn.actionHook = new_resolve(RED, config.bargeIn_actionHook, config.bargeIn_actionHookType, node, msg) : null
            config.bargeIn_input != '' ? obj.bargeIn.input = config.bargeIn_input.split(',') : null
            config.bargeIn_finishOnKey != '' ? obj.bargeIn.finishOnKey = new_resolve(RED, config.bargeIn_finishOnKey, config.bargeIn_finishOnKeyType, node, msg) : null
            config.bargeIn_numDigits != '' ? obj.bargeIn.numDigits = new_resolve(RED, config.bargeIn_numDigits, config.bargeIn_numDigitsType, node, msg) : null
            config.bargeIn_minDigits != '' ? obj.bargeIn.minDigits = new_resolve(RED, config.bargeIn_minDigits, config.bargeIn_minDigitsType, node, msg) : null
            config.bargeIn_maxDigits != '' ? obj.bargeIn.maxDigits = new_resolve(RED, config.bargeIn_maxDigits, config.bargeIn_maxDigitsType, node, msg) : null
            config.bargeIn_interDigitTimeout != '' ? obj.bargeIn.interDigitTimeout = new_resolve(RED, config.bargeIn_interDigitTimeout, config.bargeIn_interDigitTimeoutType, node, msg) : null
          }

          if (config.amd){
            obj.amd = {timers : {}}
            config.amd_actionHook != '' ? obj.amd.actionHook = new_resolve(RED, config.amd_actionHook, config.amd_actionHookType, node, msg) : null
            config.amd_thresholdWordCount != '' ? obj.amd.thresholdWordCount = new_resolve(RED, config.amd_thresholdWordCount, config.amd_thresholdWordCountType, node, msg) : null
            config.amd_timers_noSpeechTimeoutMs != '' ? obj.amd.timers.noSpeechTimeoutMs = new_resolve(RED, config.amd_timers_noSpeechTimeoutMs, config.amd_timers_noSpeechTimeoutMsType, node, msg) : null
            config.amd_timers_decisionTimeoutMs != '' ? obj.amd.timers.decisionTimeoutMs = new_resolve(RED, config.amd_timers_decisionTimeoutMs, config.amd_timers_decisionTimeoutMsType, node, msg) : null
            config.amd_timers_toneTimeoutMs != '' ?	 obj.amd.timers.toneTimeoutMs = new_resolve(RED, config.amd_timers_toneTimeoutMs, config.amd_timers_toneTimeoutMsType, node, msg) : null
            config.amd_timers_greetingCompletionTimeoutMs != '' ? obj.amd.timers.greetingCompletionTimeoutMs = new_resolve(RED, config.amd_timers_greetingCompletionTimeoutMs, config.amd_timers_greetingCompletionTimeoutMsType, node, msg) : null
          }

          if (config.record){
            obj.record = {}
            config.record_action != '' ? obj.record.action = config.record_action : null //TODO if multiple, split into array
            config.record_siprecServerURL != '' ? obj.record.siprecServerURL = new_resolve(RED, config.record_siprecServerURL, config.record_siprecServerURLType, node, msg) : null
            config.record_recordingID != '' ? obj.record.recordingID = new_resolve(RED, config.record_recordingID, config.record_recordingIDType, node, msg) : null
          }
          appendVerb(msg,  obj);
          node.send(msg);
        });
      }
    RED.nodes.registerType('cfg', cfg);
}