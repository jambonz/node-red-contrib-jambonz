var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  function dial(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async function(msg) {
      node.log(`dial config: ${JSON.stringify(config)}, msg.call: ${JSON.stringify(msg.call)}`);
      const target = await Promise.all(config.targets.map(async (t) => {
        const obj = { type: t.type };  // Initialize with type property
        const dest = await new_resolve(RED, t.dest, t.varType, node, msg);
        const trunk = await new_resolve(RED, t.trunk, t.trunkType, node, msg);
        const tenant = t.tenant ? await new_resolve(RED, t.tenant, t.tenantType, node, msg) : '';
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
            break;
          case 'teams':
            obj.number = dest;
            if (tenant) obj.tenant = tenant;
            if (t.vmail) obj.vmail = t.vmail;
            break;
        }
        return obj;
      }));
      const data = {
        verb: 'dial',
        target,
        answerOnBridge: config.answeronbridge,
        timeLimit: config.timelimit ? parseInt(config.timelimit) : null,
        timeout: config.timeout ? parseInt(config.timeout) : null,
        callerId: await new_resolve(RED, config.callerid, config.calleridType, node, msg),
        callerName: await new_resolve(RED, config.callername, config.callernameType, node, msg),
        actionHook: await new_resolve(RED, config.actionhook, config.actionhookType, node, msg),
        confirmHook: await new_resolve(RED, config.confirmhook, config.confirmhookType, node, msg), 
        dialMusic: await new_resolve(RED, config.dialmusic, config.dialmusicType, node, msg),
        referHook: await new_resolve(RED, config.referhook, config.referhookType, node, msg),
        dtmfHook: await new_resolve(RED, config.dtmfhook, config.dtmfhookType, node, msg),
      };

      if (config.hasOwnProperty('anchormedia')) {
        data.anchorMedia = config.anchormedia;
      }

      if (config.onholdhook) {
        data.onHoldHook = await new_resolve(RED, config.onholdhook, config.onholdhookType, node, msg);
      }

      // headers
      const headers = {};
      config.headers.forEach(function(h) {
        if (h.h.length && h.v.length) headers[h.h] = h.v;
      });
      Object.assign(data, {headers});

      // nested listen
      if (config.listenurl && config.listenurl.length > 0) {
        data.listen = {
          url: await new_resolve(RED, config.listenurl, config.listenurlType, node, msg),
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
          var diarizationMin = await new_resolve(RED, config.diarizationmin, config.diarizationminType, node, msg);
          var diarizationMax = await new_resolve(RED, config.diarizationmax, config.diarizationmaxType, node, msg)
          var hints = await new_resolve(RED, config.transcriptionhints, config.transcriptionhintsType, node, msg)
          var altlangs = await new_resolve(RED, config.recognizeraltlang, config.recognizeraltlangType, node, msg)
          var naics = await new_resolve(RED, config.naics, config.naicsType, node, msg)
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
        data.transcribe = {
          transcriptionHook: await new_resolve(RED, config.transcriptionhook, config.transcriptionhookType, node, msg),
          recognizer
        };
      }
      // dtmf capture
      const dtmfCapture = await new_resolve(RED, config.dtmfcapture, config.dtmfcaptureType, node, msg);
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