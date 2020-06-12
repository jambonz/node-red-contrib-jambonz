module.exports = function(RED) {

  function leave(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.url = config.url;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz leave verb
      var obj = {
        verb: 'leave',
      };

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('leave', leave);
};
