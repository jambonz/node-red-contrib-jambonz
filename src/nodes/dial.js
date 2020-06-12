module.exports = function(RED) {

  function dial(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      var obj = {
        target: config.targets
      };
  
      // simple properties
      node.log(`config: ${JSON.stringify(config)}`);
      [
        {actionhook: 'actionHook'},
        {answeronbridge: 'answerOnBridge'},
        {callerid: 'callerId'},
        {confirmhook: 'confirmHook'},
        {dialmusic: 'dialMusic'},
        {dtmfcapture: 'dtmfCapture'},
        {dtmfhook: 'dtmfHook'},
        {timelimit: 'timeLimit'},
        {timeout: 'timeout'}
      ].forEach(function(o) {
        var key = Object.keys(o)[0];
        var value = config[key];
        node.log(`${key}: ${value}`);
        if (value) obj[o[key]] = config[key];
      });
  
      var data = Object.assign({verb: 'dial'}, obj);

      // headers
      var headers = {};
      config.headers.forEach(function(h) {
        if (h.h.length && h.v.length) headers[h.h] = h.v;
      });
      Object.assign(data, {headers});

      // nested listen
      if (config.listenurl && config.listenurl.length > 0) {
        data.listen = {
          url: config.listenurl,
          mixType: 'stereo'
        };
      }
  
      // nested transcribe
      if (config.transcribeurl && config.transcribeurl.length > 0) {
        data.transcribe = {
          transcriptionHook: config.transcribeurl,
          recognizer: {
            vendor: 'google',
            language: config.transcribelang,
            interim: config.interim
          }
        };
      }

      node.log(`dial verb: ${JSON.stringify(data)}`);

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(data);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('dial', dial);
};
