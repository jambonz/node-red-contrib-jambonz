const bent = require("bent");

module.exports = function (RED) {
  function get_calls(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const { accountSid, apiToken } = server.credentials;
    node.on("input", async (msg, send, done) => {
      const req = bent(
        `${server.url}/v1/Accounts/${accountSid}/Calls`,
        "GET",
        "json",
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
