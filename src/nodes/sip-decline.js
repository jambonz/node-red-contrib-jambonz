var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** sip:decline */
  function sip_decline(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', async function(msg) {
      var status = await new_resolve(RED, config.status, config.statusType, node, msg);
      var reason = await new_resolve(RED, config.reason, config.reasonType, node, msg);
      var obj = {
        verb: 'sip:decline',
        status: parseInt(status),
        reason
      }
      config.headers ? obj.headers = await new_resolve(RED, config.headers, config.headersType, node, msg) : null
      if (typeof obj.headers == 'string'){
        obj.headers = JSON.parse(obj.headers)
      }
      appendVerb(msg, obj);
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:decline', sip_decline);
}