var {createHash} = require('crypto');
const bent = require('bent');
var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
  function dial(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function(msg) {

      node.log(`dial config: ${JSON.stringify(config)}, msg.call: ${JSON.stringify(msg.call)}`);
      var target = config.targets.map((t) => {
        const obj = Object.assign({}, t);
        var dest = v_resolve(obj.dest, obj.varType, this.context(), msg);
        node.log(`dial: dest ${t.varType}:${t.dest} resolved to ${dest}`);
        switch (t.type) {
          case 'phone':
            obj.number = dest;
            break;
          case 'user':
            obj.name = dest;
            break;
          case 'sip':
            obj.sipUri = dest;
            if (t.user) {
              obj.auth = {
                username: t.user,
                password: t.pass
              };
            }
            delete obj.user;
            delete obj.pass;
            break;
          case 'teams':
            obj.number = dest;
            break;
        }
        delete obj.varType;
        delete obj.dest;
        return obj;
      });
      var data = {
        verb: 'dial',
        target,
        answerOnBridge: config.answeronbridge,
        timeLimit: config.timelimit ? parseInt(config.timelimit) : null,
        timeout: config.timeout ? parseInt(config.timeout) : null,
        callerId: v_resolve(config.callerid, config.calleridType, this.context(), msg),
        actionHook: v_resolve(config.actionhook, config.actionhookType, this.context(), msg),
        confirmHook: v_resolve(config.confirmhook, config.confirmhookType, this.context(), msg),
        dialMusic: v_resolve(config.dialmusic, config.dialmusicType, this.context(), msg),
        dtmfHook: v_resolve(config.dtmfhook, config.dtmfhookType, this.context(), msg)
      };


      // headers
      var headers = {};
      config.headers.forEach(function(h) {
        if (h.h.length && h.v.length) headers[h.h] = h.v;
      });
      Object.assign(data, {headers});

      // nested listen
      if (config.listenurl && config.listenurl.length > 0) {
        data.listen = {
          url: v_resolve(config.listenurl, config.listenurlType, this.context(), msg),
          mixType: 'stereo'
        };
      }

      // nested transcribe
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
        data.transcribe = {
          transcriptionHook: v_resolve(config.transcriptionhook, config.transcriptionhookType, this.context(), msg),
          recognizer
        };
      }
      // dtmf capture
      const dtmfCapture = v_resolve(config.dtmfcapture, config.dtmfcaptureType, this.context(), msg);
      if (dtmfCapture && dtmfCapture.length) {
        data.dtmfCapture = dtmfCapture.split(',').map((i) => i.trim());
      }
      else {
        delete data.dtmfHook;
      }


      node.log(`dial verb: ${JSON.stringify(data)}`);

      appendVerb(msg, data);
      node.log(`dial jambonz: ${JSON.stringify(msg.jambonz)}`);
      node.send(msg);
    });
  }
  RED.nodes.registerType('dial', dial);
}