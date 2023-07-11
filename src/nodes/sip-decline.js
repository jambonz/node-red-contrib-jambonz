var {appendVerb, new_resolve} = require('./libs')

module.exports = function(RED) {
  /** sip:decline */
  function sip_decline(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      var status = new_resolve(RED, config.status, config.statusType, node, msg);
      var reason = new_resolve(RED, config.reason, config.reasonType, node, msg);
      appendVerb(msg, {
        verb: 'sip:decline',
        status: parseInt(status),
        reason
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('sip:decline', sip_decline);
}