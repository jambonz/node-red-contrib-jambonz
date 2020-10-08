var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};

/** user auth */
module.exports = function(RED) {
  function userauth(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var attemptedAuthentication = false;
      var auth = msg.authRequest;
      var authResponse = {};
      var ha1_string;
      if (config.ha1 && config.ha1.length) {
        ha1_string =  v_resolve(config.ha1, config.ha1Type, this.context(), msg);
        attemptedAuthentication = true;
        node.log(`user auth: validating user ${auth.username} domain ${auth.realm} based on hashed password`);
      }
      else if (config.password && config.password.length) {
        var password = v_resolve(config.password, config.passwordType, this.context(), msg);
        var ha1 = createHash('md5');
        ha1.update([auth.username, auth.realm, password].join(':'));
        ha1_string = ha1.digest('hex');
        attemptedAuthentication = true;
        node.log(`user auth: validating user ${auth.username} domain ${auth.realm} based on plaintext password`);
      }
      else {
        node.log('user auth: failing due to no password provided');
      }

      if (attemptedAuthentication) {
        var ha2 = createHash('md5');
        ha2.update([auth.method, auth.uri].join(':'));
        var response = createHash('md5');
        var responseParams = [
          ha1_string,
          auth.nonce
        ];

        if (auth.cnonce) {
          responseParams.push(auth.nc);
          responseParams.push(auth.cnonce);
        }

        if (auth.qop) {
          responseParams.push(auth.qop);
        }

        responseParams.push(ha2.digest('hex'));
        response.update(responseParams.join(':'));

        var calculated = response.digest('hex');
        if (calculated === auth.response) {
          Object.assign(authResponse, {status: 'ok'});
        }
        else {
          Object.assign(authResponse, {status: 'fail', msg: 'incorrect password'});
        }
      }
      else {
        Object.assign(authResponse, {status: 'fail', msg: 'invalid domain or username'});
      }

      msg.authResponse = authResponse;
      node.send(msg);
    });
  }
  RED.nodes.registerType('user auth', userauth);

  /** play */
  function play(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      appendVerb(msg,  {
        verb: 'play',
        url: v_resolve(config.url, config.urlType, this.context(), msg),
        earlyMedia: config.early,
        loop: config.loop
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('play', play);

  /** pause */
  function pause(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var val = v_resolve(config.len, config.lenType, this.context(), msg);
      var length = /^\d+$/.test(val) ? parseInt(val) : parseFloat(val);
      appendVerb(msg, {
        verb: 'pause',
        length
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('pause', pause);

  /** tag */
  function tag(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var data = v_resolve(config.data, config.dataType, this.context(), msg, true);
      appendVerb(msg, {
        verb: 'tag',
        data
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('tag', tag);

  /** leave */
  function leave(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      appendVerb(msg, {
        verb: 'leave'
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('leave', leave);

  /** lex */
  function lex(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var bot = v_resolve(config.bot, config.botType, this.context(), msg);
      var alias = v_resolve(config.alias, config.aliasType, this.context(), msg);
      var val = v_resolve(config.inputTimeout, config.inputTimeoutType, this.context(), msg);
      var timeout = /^\d+$/.test(val) ? parseInt(val) : 0;
      var eventHook = v_resolve(config.eventHook, config.eventHookType, this.context(), msg);
      var actionHook = v_resolve(config.actionHook, config.actionHookType, this.context(), msg);
      const obj = {
        verb: 'lex',
        bot,
        alias,
        region: config.region,
        prompt: config.prompt,
        bargein: config.bargein,
        passDtmf: config.passDtmf
      };
      if (eventHook && eventHook.length > 0) obj.eventHook = eventHook;
      if (actionHook && actionHook.length > 0) obj.actionHook = actionHook;
      if (timeout) obj.noInputTimeout = timeout;
      if (config.prompt === 'tts') {
        obj.tts = {
          vendor: config.vendor,
          language: config.lang,
          voice: config.voice
        };
      }

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('lex', lex);

  /** listen */
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
        obj.transcription = {
          transcriptionHook: v_resolve(config.transcriptionhook, config.transcriptionhookType, this.context(), msg),
          language: config.transcribelang,
          interim: config.interim,
          profanityFilter: config.profanityFilter,
          dualChannel: config.mixtype === 'stereo'
        };
        node.log(`language: ${config.recognizerlang}`);
        if (config.recognizerlang !== 'default') obj.transcription.language = config.recognizerlang;
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

    /** message */
    function message(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      node.on('input', function(msg, send, done) {
        var from = v_resolve(config.from, config.fromType, this.context(), msg);
        var to = v_resolve(config.to, config.toType, this.context(), msg);
        var text = v_resolve(config.text, config.textType, this.context(), msg);
        var provider = v_resolve(config.provider, config.providerType, this.context(), msg);
        if ((!provider || 0 === provider.length) && msg.sms.provider) {
          provider = msg.sms.provider;
        }
  
        appendVerb(msg, {
          verb: 'message',
          from,
          to,
          text,
          provider
        });
        node.send(msg);
      });
    }
    RED.nodes.registerType('message', message);
  
  /** hangup */
  function hangup(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      appendVerb(msg, {
        verb: 'hangup'
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('hangup', hangup);

  /** sip:decline */
  function sip_decline(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var status = v_resolve(config.status, config.statusType, this.context(), msg);
      var reason = v_resolve(config.reason, config.reasonType, this.context(), msg);
      appendVerb(msg, {
        verb: 'sip:decline',
        status: parseInt(status),
        reason
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:decline', sip_decline);

  /** redirect */
  function redirect(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      var actionHook = v_resolve(config.hook, config.hookType, this.context(), msg);
      appendVerb(msg, {
        verb: 'redirect',
        actionHook
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('redirect', redirect);

  /** dequeue */
  function dequeue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      appendVerb(msg, {
        verb: 'dequeue',
        name:  v_resolve(config.queue, config.queueType, this.context(), msg),
        beep: config.beep,
        actionHook: v_resolve(config.actionHook, config.actionHookType, this.context(), msg),
        confirmHook: v_resolve(config.confirmHook, config.confirmHookType, this.context(), msg),
        timeout:  v_resolve(config.timeout, config.timeoutType, this.context(), msg)
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('dequeue', dequeue);

  /** enqueue */
  function enqueue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      appendVerb(msg, {
        verb: 'enqueue',
        name:  v_resolve(config.queue, config.queueType, this.context(), msg),
        actionHook: v_resolve(config.actionHook, config.actionHookType, this.context(), msg),
        waitHook: v_resolve(config.waitHook, config.waitHookType, this.context(), msg)
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('enqueue', enqueue);

  /** conference */
  function conference(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var val = v_resolve(config.maxParticipants, config.maxParticipantsType, this.context(), msg);
      var maxParticipants = /^\d+$/.test(val) ? parseInt(val) : val;

      appendVerb(msg, {
        verb: 'conference',
        name:  v_resolve(config.conference, config.conferenceType, this.context(), msg),
        enterHook: v_resolve(config.enterHook, config.enterHookType, this.context(), msg),
        waitHook: v_resolve(config.waitHook, config.waitHookType, this.context(), msg),
        maxParticipants,
        beep: config.beep,
        startOnEnter: config.startOnEnter,
        endOnExit: config.endOnExit
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('conference', conference);

  /** say */
  function say(config) {
    RED.nodes.createNode(this, config);
    this.text = config.text;
    this.early = config.early;
    this.loop = config.loop;
    var node = this;

    node.on('input', function(msg) {

      node.log(`say config: ${JSON.stringify(config)}, msg.call: ${JSON.stringify(msg.call)}`);
      const text = v_text_resolve(node, this.text, this.context(), msg);

      // jambonz say verb
      var obj = {
        verb: 'say',
        text,
        loop: parseInt(node.loop),
        earlyMedia: node.early
      };
      if (['aws', 'google'].includes(node.vendor)) {
        Object.assign(obj, {
          synthesizer: {
            vendor: config.vendor,
            language: config.lang,
            voice: config.voice
          }
        });
      }

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('say', say);
  require('./http-helpers')(RED);

  /** gather */
  function gather(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {

      // simple properties
      node.log(`config: ${JSON.stringify(config)}`);

      var obj = {verb: 'gather', input: []};
      if (config.actionhook) obj.actionHook = config.actionhook;

      // input
      if (config.speechinput) {
        obj.input.push('speech');
        obj.recognizer = {vendor: 'google'};
        if (config.recognizerlang !== 'default') obj.recognizer.language = config.recognizerlang;
        if (config.recognizerhints && config.recognizerhints.length) {
          var hints = v_resolve(config.recognizerhints, config.recognizerhintsType, this.context(), msg);
          obj.recognizer.hints = hints
            .split(',')
            .map((str) => str.trim());
        }
      }
      if (config.dtmfinput) {
        obj.input.push('digits');
        if (config.finishonkey && config.finishonkey.length) obj.finishOnKey = obj.finishonkey;
        if (/^\d+$/.test(config.numdigits)) obj.numDigits = parseInt(config.numdigits);
        if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
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
      else obj.play = {url: v_resolve(config.playurl, config.playurlType, this.context(), msg)};

      node.log(`gather: ${JSON.stringify(obj)}`);

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('gather', gather);

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
            obj.user = dest;
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
      if (config.transcribeurl && config.transcribeurl.length > 0) {
        data.transcribe = {
          transcriptionHook: v_resolve(config.transcribeurl, config.transcribeurlType, this.context(), msg),
          recognizer: {
            vendor: 'google',
            language: config.transcribelang,
            interim: config.interim
          }
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

  /** dialogflow */
  function dialogflow(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var val = v_resolve(config.inputTimeout, config.inputTimeoutType, this.context(), msg);
      var timeout = /^\d+$/.test(val) ? parseInt(val) : 0;
      var eventHook = v_resolve(config.eventHook, config.eventHookType, this.context(), msg);
      var actionHook = v_resolve(config.actionHook, config.actionHookType, this.context(), msg);
      var welcomeEvent = v_resolve(config.welcomeEvent, config.welcomeEventType, this.context(), msg);
      var welcomeEventParams;
      if (welcomeEvent && welcomeEvent.length > 0) {
        welcomeEventParams = v_resolve(config.welcomeEventParams, config.welcomeEventParamsType, this.context(), msg);
      }
      var noInputEvent = v_resolve(config.noInputEvent, config.noInputEventType, this.context(), msg);
      const obj = {
        verb: 'dialogflow',
        credentials:  v_resolve(config.serviceAccountCredentials,
          config.serviceAccountCredentialsType, this.context(), msg),
        project:  v_resolve(config.project, config.projectType, this.context(), msg),
        lang:  config.recognizerlang,
      };
      if (welcomeEvent) {
        obj.welcomeEvent = welcomeEvent;
        if (welcomeEventParams) obj.welcomeEventParams = welcomeEventParams;
      }
      if (eventHook && eventHook.length > 0) obj.eventHook = eventHook;
      if (actionHook && actionHook.length > 0) obj.actionHook = actionHook;
      if (timeout) obj.noInputTimeout = timeout;
      if (timeout && noInputEvent) obj.noInputEvent = noInputEvent;
      if (config.prompt === 'tts') {
        obj.tts = {
          vendor: config.vendor,
          language: config.lang,
          voice: config.voice
        };
      }

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('dialogflow', dialogflow);

  function jambonz_auth(config) {
    RED.nodes.createNode(this, config);
    this.url = config.url;
    this.accountSid = config.accountSid;
    this.apiKey = config.apiKey;
  }

  RED.nodes.registerType('jambonz_auth', jambonz_auth, {
    credentials: {
      url: {type: 'text'},
      accountSid: {type: 'text'},
      apiToken: {type: 'text'}
    }
  });

  function doLCC(node, baseUrl, accountSid, apiToken, callSid, opts) {
    const post = bent(`${baseUrl}/v1/`, 'POST', 'json', 202, {
      'Authorization': `Bearer ${apiToken}`
    });
    const url = `Accounts/${accountSid}/Calls/${callSid}`;
    node.log(`invoking LCC with callSid ${callSid} at ${baseUrl}/v1/${url}`);
    return post(url, opts);
  }

  function doCreateCall(baseUrl, accountSid, apiToken, opts) {
    const post = bent(`${baseUrl}/v1/`, 'POST', 'json', 201, {
      'Authorization': `Bearer ${apiToken}`
    });
    return post(`Accounts/${accountSid}/Calls`, opts);
  }

  function doCreateMessage(baseUrl, accountSid, apiToken, opts) {
    const post = bent(`${baseUrl}/v1/`, 'POST', 'json', 201, {
      'Authorization': `Bearer ${apiToken}`
    });
    return post(`Accounts/${accountSid}/Messages`, opts);
  }


  /** LCC */
  function lcc(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async(msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {url, accountSid, apiToken} = server.credentials;
      const callSid = v_resolve(config.callSid, config.callSidType, this.context(), msg);
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
        case 'mute':
          opts.mute_status = 'mute';
          break;
        case 'unmute':
          opts.mute_status = 'unmute';
          break;
        case 'pause':
          opts.listen_status = 'pause';
          break;
        case 'resume':
          opts.listen_status = 'resume';
          break;
        case 'redirect':
          node.log(`LCC redirect callHook ${config.callHook} callHookType: ${config.callHookType}`);
          opts.call_hook = {url: v_resolve(config.callHook, config.callHookType, this.context(), msg)};
          break;
        case 'whisper':
          Object.assign(opts, {
            whisper: {
              verb: 'say',
              text: config.text
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
        default:
          node.log(`invalid action: ${config.action}`);
          send(msg);
          if (done) done();
          return;
      }

      try {
        await doLCC(node, url, accountSid, apiToken, callSid, opts);
        msg.statusCode = 202;
        node.log(`successfully sent LCC with opts ${JSON.stringify(opts)}`);
      } catch (err) {
        if (err.statusCode) msg.statusCode = err.statusCode;
        else {
          node.log(`Error sending LCC ${JSON.stringify(err)}`);
          if (done) done(err);
          else node.error(err, msg);
          send(msg);
          return;
        }
      }
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('lcc', lcc);

  /** Create call */
  function create_call(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async(msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {url, accountSid, apiToken} = server.credentials;
      if (!url || !accountSid || !apiToken) {
        node.log(`invalid / missing credentials, skipping create-call node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = v_resolve(config.from, config.fromType, this.context(), msg);
      var to = v_resolve(config.to, config.toType, this.context(), msg);

      const opts = {
        application_sid: config.application,
        from,
        to: {
          type: config.dest
        },
      };
      if (config.timeout) {
        const timeout = parseInt(config.timeout);
        if (timeout > 0) opts.timeout = timeout;
      }
      switch (config.dest) {
        case 'phone':
          opts.to.number = to;
          break;
        case 'user':
          opts.to.name = to;
          break;
        case 'sip':
          opts.to.sipUri = to;
          break;
        case 'ms-teams':
          opts.to.user = to;
          break;
        default:
          if (done) done(`unknown dest type ${config.dest}`);
          else node.error(`unknown dest type ${config.dest}`, msg);
          send(msg);
          return;
      }

      try {
        node.log(`sending create call ${JSON.stringify(opts)}`);
        const res = await doCreateCall(url, accountSid, apiToken, opts);
        msg.statusCode = 202;
        msg.callSid = res.sid;
        node.log(`successfully launched call with callSid ${msg.callSid}`);
      } catch (err) {
        if (err.statusCode) {
          node.log(`create-call failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
        }
        else {
          node.log(`Error sending create all ${JSON.stringify(err)}`);
          if (done) done(err);
          else node.error(err, msg);
          send(msg);
          return;
        }
      }
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('create-call', create_call);

  /** Create sms */
  function create_sms(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);

    node.on('input', async(msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments);};

      const {url, accountSid, apiToken} = server.credentials;
      if (!url || !accountSid || !apiToken) {
        node.log(`invalid / missing credentials, skipping create-message node: ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      var from = v_resolve(config.from, config.fromType, this.context(), msg);
      var to = v_resolve(config.to, config.toType, this.context(), msg);
      var text = v_resolve(config.text, config.textType, this.context(), msg);
      var provider = v_resolve(config.provider, config.providerType, this.context(), msg);

      const opts = {
        from,
        to,
        text,
        provider
      };

      try {
        node.log(`sending create message ${JSON.stringify(opts)}`);
        const res = await doCreateMessage(url, accountSid, apiToken, opts);
        msg.statusCode = 202;
        msg.messageSid = res.sid;
        msg.providerResponse = res.providerResponse;
        node.log(`successfully launched call with messageSid ${msg.messageSid}`);
      } catch (err) {
        if (err.statusCode) {
          node.log(`create_message failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
        }
        else {
          node.log(`Error sending create message ${JSON.stringify(err)}`);
          if (done) done(err);
          else node.error(err, msg);
          send(msg);
          return;
        }
      }
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('create-sms', create_sms);
};

// helper functions

function appendVerb(msg, obj) {
  const data = {};
  Object.keys(obj).forEach((key) => {
    const v = obj[key];
    if (null === v || typeof v === 'undefined' ||
      (typeof v === 'string' && !v.length) ||
      (typeof v === 'object' && Object.keys(v).length === 0)) return;
    data[key] = v;
  });
  msg.jambonz = msg.jambonz || [];
  msg.jambonz.push(data);
}

/**
 * resolve a value that may be either a string or a property of the msg, flow, or global context
 */
function v_resolve(val, valType, context, msg, asJson) {
  if (!val || !valType) return val;
  switch (valType) {
    case 'str':
    case 'num':
      return val;
    case 'json':
      return JSON.parse(val);

    case 'msg': return asJson === true ? msg[val] : mustache.render('{{' + val + '}}', msg);
  }

  var data = {};
  var dataobject = 'flow' === valType ? context.flow : context.global;

  if (asJson === true) return dataobject.get(val);

  var keys = dataobject.keys();
  for (var k in keys) {
    data[keys[k]] = dataobject.get(keys[k]);
  }
  return mustache.render('{{' + val + '}}', data);
}

function v_text_resolve(node, val, context, msg) {
  const flow = {};
  const glob = {};
  let keys = context.flow.keys();
  for (const k in keys) {
    flow[keys[k]] = context.flow.get(keys[k]);
  }
  keys = context.global.keys();
  for (const k in keys) {
    glob[keys[k]] = context.global.get(keys[k]);
  }

  const newString = val.trim().replace(/\${([^{}]*)}/g, (a, b) => {
    if (b.startsWith('msg.')) {
      const prop = b.slice(4);
      return msg[prop];
    }
    else if (b.startsWith('flow.')) {
      const prop = b.slice(5);
      return flow[prop];
    }
    else if (b.startsWith('global.')) {
      const prop = b.slice(7);
      return glob[prop];
    }
    return '${' + b + '}';
  });
  return newString;
}
