var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function dial(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function(msg) {
      node.log(`dial config: ${JSON.stringify(config)}, msg.call: ${JSON.stringify(msg.call)}`);
      var target = config.targets.map((t) => {
        const obj = Object.assign({}, t);
        var dest = new_resolve(RED, obj.dest, obj.varType, node, msg)
        var trunk = new_resolve(RED, obj.trunk, obj.trunkType, node, msg)
        switch (t.type) {
          case 'phone':
            obj.number = dest;
            obj.trunk = trunk;
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
        delete obj.trunkType;
        delete obj.dest;
        return obj;
      });
      var data = {
        verb: 'dial',
        target,
        answerOnBridge: config.answeronbridge,
        timeLimit: config.timelimit ? parseInt(config.timelimit) : null,
        timeout: config.timeout ? parseInt(config.timeout) : null,
        callerId: new_resolve(RED, config.callerId, config.callerIdType, node, msg),
        actionHook: new_resolve(RED, config.actionHook, config.actionHookType, node, msg),
        confirmHook: new_resolve(RED, config.confirmHook, config.confirmHookType, node, msg), 
        dialMusic: new_resolve(RED, config.dialMusic, config.dialMusicType, node, msg),
        dtmfHook: new_resolve(RED, config.dtmfHook, config.dtmfHookType, node, msg),
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
          url: new_resolve(RED, config.listenurl, config.listenurlType, node, msg),
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
          var diarizationMin = new_resolve(RED, config.diarizationMin, config.diarizationMinType, node, msg);
          var diarizationMax = new_resolve(RED, config.diarizationMax, config.diarizationMaxType, node, msg)
          var hints = new_resolve(RED, config.hints, config.hintsType, node, msg)
          var altlangs = new_resolve(RED, config.altlangs, config.altlangsType, node, msg)
          var naics = new_resolve(RED, config.naics, config.naicsType, node, msg)
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
        data.transcribe = {
          transcriptionHook: new_resolve(RED, config.transcriptionHook, config.transcriptionHookType, node, msg),
          recognizer
        };
      }
      // dtmf capture
      const dtmfCapture = new_resolve(RED, config.dtmfcapture, config.dtmfcaptureType, node, msg);
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