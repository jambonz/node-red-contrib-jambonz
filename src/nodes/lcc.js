var crypto = require('crypto');
var {new_resolve, doLCC} = require('./libs')

module.exports = function(RED) {
/** LCC */
function lcc(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const url = await new_resolve(RED, server.url, server.urlType, node, msg);
      const accountSid = await new_resolve(RED, server.credentials.accountSid, server.accountSidType, node, msg);
      const apiToken = await new_resolve(RED, server.credentials.apiToken, server.apiTokenType, node, msg);
      const callSid = await new_resolve(RED, config.callSid, config.callSidType, node, msg);
      
      if (!url || !accountSid || !apiToken || !callSid) {
        node.log(`invalid / missing credentials or callSid, skipping LCC node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      const opts = {};
      switch (config.action) {
        case 'hangup':
          opts.call_status = 'completed';
          break;
        case 'cancel':
          opts.call_status = 'no-answer';
          break;
        case 'mute':
          opts.mute_status = 'mute';
          break;
        case 'unmute':
          opts.mute_status = 'unmute';
          break;
        case 'mute_conf':
          opts.conf_mute_status = 'mute';
          break;
        case 'unmute_conf':
          opts.conf_mute_status = 'unmute';
          break;
        case 'pause':
          opts.listen_status = 'pause';
          break;
        case 'resume':
          opts.listen_status = 'resume';
          break;
        case 'pause_transcribe':
          opts.transcribe_status = 'pause';
          break;
        case 'resume_transcribe':
          opts.transcribe_status = 'resume';
          break;
        case 'redirect':
          opts.call_hook = {url: await new_resolve(RED, config.callHook, config.callHookType, node, msg)};
          if (config.childCallHook) {
            opts.child_call_hook = {url: await new_resolve(RED, config.childCallHook, config.childCallHookType, node, msg)};
          }
          break;
        case 'hold_conf':
          opts.conf_hold_status = 'hold';
          opts.wait_hook = {url: await new_resolve(RED, config.waitHook, config.waitHookType, node, msg)};
          break;
        case 'unhold_conf':
          opts.conf_hold_status = 'unhold';
          break;
        case 'whisper':
          Object.assign(opts, {
            whisper: {
              verb: 'say',
              text: await new_resolve(RED, config.text, 'mustache', node, msg),
            }
          });
          if (['aws', 'google'].includes(config.vendor)) {
            Object.assign(opts.whisper, {
              synthesizer: {
                vendor: config.vendor,
                language: config.lang,
                voice: config.voice
              }
            });
          }
          break;
        case 'sip_request':
          opts.sip_request = { 
            method: config.sipRequestMethod,
            content_type: await new_resolve(RED, config.sipRequestContentType, config.sipRequestContentTypeType, node, msg),
            content: await new_resolve(RED, config.sipRequestBody, config.sipRequestBodyType, node, msg),
            headers: await new_resolve(RED, config.sipRequestHeaders, config.sipRequestHeadersType, node, msg) || {}
          };
          break;
        case 'start_call_recording':
          opts.record = { 
            action: 'startCallRecording',
            siprecServerURL: await new_resolve(RED, config.siprecServerURL, config.siprecServerURLType, node, msg),
            recordingID: await new_resolve(RED, config.recordingID, config.recordingIDType, node, msg) || crypto.randomUUID()
          };
          // SIPREC headers
          if (config.siprecHeaders) {
            var headers = {};
            config.siprecHeaders.forEach(function(h) {
              if (h.h.length && h.v.length) headers[h.h] = h.v;
            });
            if (Object.keys(headers).length) {
              Object.assign(opts.record, {headers});
            }
          }
          break;
        case 'stop_call_recording':
          opts.record = { action: 'stopCallRecording' };
          break;
        case 'pause_call_recording':
          opts.record = { action: 'pauseCallRecording' };
          break;
        case 'resume_call_recording':
          opts.record = { action: 'resumeCallRecording' };
          break;
        case 'send_dtmf':
          opts.dtmf = { 
            digit: await new_resolve(RED, config.dtmfDigit, config.dtmfDigitType, node, msg),
            duration: await new_resolve(RED, config.dtmfDuration, config.dtmfDurationType, node, msg) || '250'
          };
          break;
        case 'tag':
          opts.tag = await new_resolve(RED, config.tag, config.tagType, node, msg);
          break;
        case 'dubAdd':
          opts.dub = { action: 'addTrack' };
          opts.dub.track = await new_resolve(RED, config.dubTrack, config.dubTrackType, node, msg);
          opts.dub.say = await new_resolve(RED, config.dubSay, config.dubSayType, node, msg) || undefined
          opts.dub.play = await new_resolve(RED, config.dubPlay, config.dubPlayType, node, msg) || undefined
          opts.dub.loop = await new_resolve(RED, config.dubLoop, config.dubLoopType, node, msg) 
          opts.dub.gain = await new_resolve(RED, config.dubGain, config.dubGainType, node, msg);
          break
        case 'dubRemove':
          opts.dub = { action: 'removeTrack' };
          opts.dub.track = await new_resolve(RED, config.dubTrack, config.dubTrackType, node, msg);
          break
        case 'dubPlay':
          opts.dub = { action: 'playOnTrack' };
          opts.dub.track = await new_resolve(RED, config.dubTrack, config.dubTrackType, node, msg);
          opts.dub.play = await new_resolve(RED, config.dubPlay, config.dubPlayType, node, msg);
          opts.dub.loop = await new_resolve(RED, config.dubLoop, config.dubLoopType, node, msg);
          opts.dub.gain = await new_resolve(RED, config.dubGain, config.dubGainType, node, msg);
          break
        case 'dubSay':
          opts.dub = { action : 'sayOnTrack' };
          opts.dub.track = await new_resolve(RED, config.dubTrack, config.dubTrackType, node, msg);
          opts.dub.say = await new_resolve(RED, config.dubSay, config.dubSayType, node, msg);
          opts.dub.loop = await new_resolve(RED, config.dubLoop, config.dubLoopType, node, msg);
          opts.dub.gain = await new_resolve(RED, config.dubGain, config.dubGainType, node, msg);
          break
        case 'dubSilence':
          opts.dub = { action: 'silenceTrack' };
          opts.dub.track = await new_resolve(RED, config.dubTrack, config.dubTrackType, node, msg);
          break          
        default:
          node.log(`invalid action: ${config.action}`);
          send(msg);
          if (done) done();
          return;
      }

      try {
        msg.payload = await doLCC(node, url, accountSid, apiToken, callSid, opts);
        msg.statusCode = config.action === 'sip_request' ? 200 : 202;
      } catch (err) {
        if (err.statusCode) {
          msg.statusCode = err.statusCode;
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error sending LCC ${err.message}`;
          if (done) done(errorMessage);
          else node.error(errorMessage, msg);
          msg.errorMessage = errorMessage;
          send(msg);
          return;
        }
      }
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('lcc', lcc);
}