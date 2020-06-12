module.exports = function(RED) {

  function enqueue(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg, send, done) {
      send = send || function() { node.send.apply(node, arguments);};

      var obj = {
        verb: 'enqueue',
        name: config.queuename
      };
      if (config.actionhook) obj.actionHook = config.actionhook;
      if (config.waithook) obj.waitHook = config.waithook;

      if (!Array.isArray(msg.payload)) msg.payload = [];
      msg.payload.push(obj);

      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType('enqueue', enqueue);
};
