module.exports = function(RED) {

  function say(config) {
    RED.nodes.createNode(this, config);
    this.text = config.text;
    this.vendor = config.vendor;
    this.lang = config.lang;
    this.voice = config.voice;
    this.early = config.early;
    this.loop = config.loop;
    var node = this;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // jambonz say verb
      var obj = {
        verb: 'say', 
        text: node.text,
        loop: parseInt(node.loop),
        earlyMedia: node.early
      };
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

  require('./http-helpers')(RED);
};
