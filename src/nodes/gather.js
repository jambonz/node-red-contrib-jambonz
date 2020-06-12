module.exports = function(RED) {

  function gather(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      // simple properties
      node.log(`config: ${JSON.stringify(config)}`);

      var obj = {verb: 'gather', input: []};
      if (config.actionhook) obj.actionHook = config.actionhook;

      // input
      if (config.speechinput) {
        obj.input.push('speech');
        obj.recognizer = {vendor: 'google'};
        if (config.recognizerlang !== 'default') obj.recognizer.language = config.recognizerlang;
        if (config.recognizerhints && config.recognizerhints.length) {
          obj.recognizer.hints = config.recognizerhints
            .split(',')
            .map(function(str) { return str.trim()});
        }
      }
      if (config.dtmfinput) {
        obj.input.push('digits');
        if (config.finishonkey && config.finishonkey.length) obj.finishOnKey = obj.finishonkey;
        if (/^\d+$/.test(config.numdigits)) obj.numDigits = parseInt(config.numdigits);
        if (/^\d+$/.test(config.timeout)) obj.timeout = parseInt(config.timeout);
      }

      // prompt
      if (config.prompttype === 'say') {
        obj.say = {text: config.text};
        if (['aws', 'google'].includes(config.vendor)) {
          Object.assign(obj.say, {
            synthesizer: {
              vendor: config.vendor,
              language: config.lang,
              voice: config.voice
            }  
          });
        }
      }
      else obj.play = {url: config.playurl};

      node.log(`gather: ${JSON.stringify(obj)}`)

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('gather', gather);
};
