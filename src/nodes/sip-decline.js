var {appendVerb, v_resolve} = require('./libs')

module.exports = function(RED) {
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
}