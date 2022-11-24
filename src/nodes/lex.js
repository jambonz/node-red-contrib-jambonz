var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')


module.exports = function(RED) {
 /** lex */
 function lex(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const awsCreds = RED.nodes.getNode(config.aws);
    node.log(`lex config: ${JSON.stringify(config)}`);
    node.log(`awsCreds: ${JSON.stringify(awsCreds)}`);
    node.on('input', function(msg) {
      let accessKey, secretAccessKey;
      if (awsCreds && awsCreds.credentials) {
        accessKey = awsCreds.credentials.accessKey;
        secretAccessKey = awsCreds.credentials.secretAccessKey;
      }
      var botId = v_resolve(config.bot, config.botType, this.context(), msg);
      var botAlias = v_resolve(config.alias, config.aliasType, this.context(), msg);
      var locale = v_resolve(config.locale, config.localeType, this.context(), msg) || 'en_US';
      var val = v_resolve(config.inputTimeout, config.inputTimeoutType, this.context(), msg);
      var timeout = /^\d+$/.test(val) ? parseInt(val) : 0;
      var eventHook = v_resolve(config.eventHook, config.eventHookType, this.context(), msg);
      var actionHook = v_resolve(config.actionHook, config.actionHookType, this.context(), msg);
      var metadata =  v_resolve(config.metadata, config.metadataType, this.context(), msg);
      var slots, intentName;

      if (config.specifyIntent) {
        intentName =  v_resolve(config.intent, config.intentType, this.context(), msg);
        if (intentName) {
          slots =  v_resolve(config.slots, config.slotsType, this.context(), msg);
        }
      }

      const obj = {
        verb: 'lex',
        botId,
        botAlias,
        region: config.region,
        locale,
        bargein: config.bargein,
        passDtmf: config.passDtmf
      };
      if (accessKey) Object.assign(obj, {credentials: {accessKey, secretAccessKey}});
      if (eventHook && eventHook.length > 0) obj.eventHook = eventHook;
      if (actionHook && actionHook.length > 0) obj.actionHook = actionHook;
      if (!config.specifyIntent && config.welcomeMessage && config.welcomeMessage.length) obj.welcomeMessage = config.welcomeMessage;
      if (timeout) obj.noInputTimeout = timeout;
      if (config.prompt === 'tts') {
        obj.tts = {
          vendor: config.vendor,
          language: config.lang,
          voice: config.voice
        };
      }

      if (intentName) {
        const intent = {name: intentName};
        if (slots && typeof slots === 'object' && Object.keys(slots).length > 0) {
          intent.slots = slots;
        }
        obj.intent = intent;
      }
      if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
        obj.metadata = metadata;
      }

      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('lex', lex);
}