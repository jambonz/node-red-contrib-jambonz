const {fetch} = require('undici');
var { new_resolve} = require("./libs");

module.exports = function (RED) {
  function get_call(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const { accountSid, apiToken } = server.credentials;
    node.on("input", async (msg, send, done) => {
      const callSid = await new_resolve(RED, config.callSid, config.callSidType, node, msg);
      if (!callSid) {
        if (done) done(new Error('CallSid empty'));
          else node.error(new Error('CallSid empty'), msg);
        return;
      }
      try {
        const response = await fetch(`${server.url}/v1/Accounts/${accountSid}/Calls/${callSid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        });
        if (!response.ok) {
          const error = new Error('Bad response');
          error.statusCode = response.status;
          error.statusText = response.statusText;
          throw error;
        }
        const res = await response.json();
        msg.payload = res;
      } catch (err) {
        if (err.statusCode) {
          node.error(`GetCall failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error getting call info ${err.message}`;
          if (done) done(errorMessage);
          else node.error(errorMessage, msg);
          msg.errorMessage = errorMessage;
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
