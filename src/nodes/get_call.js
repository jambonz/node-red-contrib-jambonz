const bent = require("bent");
var { new_resolve} = require("./libs");

module.exports = function (RED) {
  function get_call(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const { accountSid, apiToken } = server.credentials;
    node.on("input", async (msg, send, done) => {
      const callSid = new_resolve(RED, config.callSid, config.callSidType, node, msg);
      if (!callSid) {
        if (done) done(new Error('CallSid empty'));
          else node.error(new Error('CallSid empty'), msg);
        return;
      }
      const req = bent(
        `${server.url}/v1/Accounts/${accountSid}/Calls/${callSid}`,
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
          node.error(`GetCall failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
        } else {
          node.error(`Error getting call info ${JSON.stringify(err)}`);
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
  RED.nodes.registerType("get_call", get_call);
};
