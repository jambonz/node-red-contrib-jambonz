module.exports = function(RED) {

  function pause(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.length = config.length;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz play verb
      var obj = {
        verb: 'pause',
        length: parseInt(node.length)
      };

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('pause', pause);
};
