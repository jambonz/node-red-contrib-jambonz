module.exports = function(RED) {

  function play(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.url = config.url;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz play verb
      var obj = {
        verb: 'play',
        url: node.url
      };

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('play', play);
};
