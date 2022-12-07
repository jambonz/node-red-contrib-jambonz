var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb} = require('./libs')

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
              obj.recognizer.hints = config.transcriptionhints
              obj.recognizer.altLanguages = [config.altLanguages]
              obj.recognizer.naicsCode = config.naics
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
            config.bargeIn_actionHook != '' ? obj.bargeIn.actionHook = config.bargeIn_actionHook : null
            config.bargeIn_input != '' ? obj.bargeIn.input = config.bargeIn_input.split(',') : null
            config.bargeIn_finishOnKey != '' ? obj.bargeIn.finishOnKey = config.bargeIn_finishOnKey : null
            config.bargeIn_numDigits != '' ? obj.bargeIn.numDigits = config.bargeIn_numDigits : null
            config.bargeIn_minDigits != '' ? obj.bargeIn.minDigits = config.bargeIn_minDigits : null
            config.bargeIn_maxDigits != '' ? obj.bargeIn.maxDigits = config.bargeIn_maxDigits : null
            config.bargeIn_interDigitTimeout != '' ? obj.bargeIn.interDigitTimeout = config.bargeIn_interDigitTimeout : null
          }
          console.log(obj)
          appendVerb(msg,  obj);
          node.send(msg);
        });
      }
    RED.nodes.registerType('cfg', cfg);
}