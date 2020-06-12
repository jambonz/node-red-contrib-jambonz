module.exports = function(RED) {

  function hangup(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz hangup verb
      var obj = {
        verb: 'hangup'
      };

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('hangup', hangup);
};
