var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
 /** lex */
 function lex(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const awsCreds = RED.nodes.getNode(config.aws);
    node.on('input', async function(msg) {
      let accessKey, secretAccessKey;
      if (awsCreds && awsCreds.credentials) {
        accessKey = awsCreds.credentials.accessKey;
        secretAccessKey = awsCreds.credentials.secretAccessKey;
      }
      var eventHook = await new_resolve(RED, config.eventHook, config.eventHookType, node, msg);
      var actionHook = await new_resolve(RED, config.actionHook, config.actionHookType, node, msg);
      var botId = await new_resolve(RED, config.bot, config.botType, node, msg);
      var botAlias = await new_resolve(RED, config.alias, config.aliasType, node, msg);
      var locale = await new_resolve(RED, config.locale, config.localeType, node, msg) || 'en_US';  
      var val = await new_resolve(RED, config.inputTimeout, config.inputTimeoutType, node, msg);
      var timeout = /^\d+$/.test(val) ? parseInt(val) : 0;
      var slots, intentName;
      if (config.specifyIntent) {
        intentName =  await new_resolve(RED, config.intent, config.intentType, node, msg);
        if (intentName) {
          slots =  await new_resolve(RED, config.slots, config.slotsType, node, msg);
        }
      }
      var metadata =  await new_resolve(RED, config.metadata, config.metadataType, node, msg);

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