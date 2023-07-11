const bent = require("bent");
var { new_resolve} = require("./libs");

module.exports = function (RED) {
  function get_calls(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const { accountSid, apiToken } = server.credentials;
    node.on("input", async (msg, send, done) => {
      const data = {
        direction: new_resolve(RED, config.direction, config.directionType, node, msg),
        from: new_resolve(RED, config.from, config.fromType, node, msg),
        to: new_resolve(RED, config.to, config.toType, node, msg),
        callStatus: new_resolve(RED, config.callStatus, config.callStatusType, node, msg),
      };
      Object.keys(data).forEach(
        (k) => data[k] == null || (data[k] == '' && delete data[k])
      );
      const params = new URLSearchParams(data).toString();
      const req = bent(
        `${server.url}/v1/Accounts/${accountSid}/Calls${ params ? '?' + params : ''}`,
        'GET',
        'json',
        {
          Authorization: `Bearer ${apiToken}`,
        }
      );
      try {
        const res = await req();
        msg.payload = res;
      } catch (err) {
        if (err.statusCode) {
          node.error(`GetCalls failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
        } else {
          node.error(`Error getting calls ${JSON.stringify(err)}`);
          if (done) done(err);
          else node.error(err, msg);
          send(msg);
          return;
        }
      }
      send(msg);
      if (done) done();
    });
  }
  RED.nodes.registerType("get_calls", get_calls);
};
