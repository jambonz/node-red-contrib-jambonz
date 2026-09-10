var {appendVerb, new_resolve} = require('./libs');

module.exports = function(RED) {
  /** transfer - packaged blind or warm transfer of the call */
  function transfer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments); };
      try {
        const obj = { verb: 'transfer' };

        obj.mode = config.mode;
        config.target ? obj.target = await new_resolve(RED, config.target, config.targetType, node, msg) : null;
        config.callerId ? obj.callerId = await new_resolve(RED, config.callerId, config.callerIdType, node, msg) : null;
        config.callerName ? obj.callerName = await new_resolve(RED, config.callerName, config.callerNameType, node, msg) : null;
        config.referredBy ? obj.referredBy = await new_resolve(RED, config.referredBy, config.referredByType, node, msg) : null;
        if (config.blindMethod && config.blindMethod !== 'default') obj.blindMethod = config.blindMethod;
        config.timeout ? obj.timeout = parseInt(await new_resolve(RED, config.timeout, config.timeoutType, node, msg)) : null;
        config.headers ? obj.headers = await new_resolve(RED, config.headers, config.headersType, node, msg) : null;
        config.amd ? obj.amd = await new_resolve(RED, config.amd, config.amdType, node, msg) : null;
        config.confirm ? obj.confirm = await new_resolve(RED, config.confirm, config.confirmType, node, msg) : null;
        config.onHoldHook ? obj.onHoldHook = await new_resolve(RED, config.onHoldHook, config.onHoldHookType, node, msg) : null;
        config.actionHook ? obj.actionHook = await new_resolve(RED, config.actionHook, config.actionHookType, node, msg) : null;
        config.eventHook ? obj.eventHook = await new_resolve(RED, config.eventHook, config.eventHookType, node, msg) : null;

        if (config.briefText) {
          obj.brief = { text: await new_resolve(RED, config.briefText, config.briefTextType, node, msg) };
        }

        if (config.anchorMedia) obj.anchorMedia = true;
        if (config.callerPresent) obj.callerPresent = true;
        if (config.disposition) obj.disposition = true;

        appendVerb(msg, obj);
        send(msg);
        if (done) done();
      } catch (err) {
        if (done) done(err.message);
        else node.error(`Error building transfer verb: ${err.message}`, msg);
      }
    });
  }
  RED.nodes.registerType('transfer', transfer);
};
