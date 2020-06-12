module.exports = function(RED) {

  function sip_decline(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.status = config.status;
    this.reason = config.reason;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz play verb
      var obj = {
        verb: 'sip:decline',
      };
      if (node.status.length) obj.status = parseInt(node.status);
      if (node.reason.length) obj.reason = node.reason;

      node.log(`status: ${node.status}, reason: ${node.reason}`);

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('sip:decline', sip_decline);
};
