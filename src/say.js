module.exports = function(RED) {
  function say(config) {
    RED.nodes.createNode(this, config);
    this.text = config.text;
    this.vendor = config.vendor;
    this.lang = config.lang;
    this.voice = config.voice;
    var node = this;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz say verb
      node.log(`vendor ${node.vendor}`);
      node.log(`lang ${node.lang}`);
      node.log(`voice ${node.voice}`);
      var obj = {verb: 'say', text: node.text};
      if (['aws', 'google'].includes(node.vendor)) {
        Object.assign(obj, {
          synthesizer: {
            vendor: node.vendor,
            language: node.lang,
            voice: node.voice
          }
        });
      }

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('say', say);
};
