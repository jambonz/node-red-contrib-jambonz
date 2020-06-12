module.exports = function(RED) {

  function dequeue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      var obj = {
        verb: 'dequeue',
        name: config.queuename
      };
      if (config.actionhook) obj.actionHook = config.actionhook;
      if (config.timeout && config.timeout.length) obj.timeout = parseInt(config.timeout);
      if (config.beep === true) obj.beep = true;

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('dequeue', dequeue);
};
