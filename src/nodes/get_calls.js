const {fetch} = require('undici');
var { new_resolve} = require("./libs");

module.exports = function (RED) {
  function get_calls(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const { accountSid, apiToken } = server.credentials;
    node.on("input", async (msg, send, done) => {
      const data = {
        direction: await new_resolve(RED, config.direction, config.directionType, node, msg),
        from: await new_resolve(RED, config.from, config.fromType, node, msg),
        to: await new_resolve(RED, config.to, config.toType, node, msg),
        callStatus: await new_resolve(RED, config.callStatus, config.callStatusType, node, msg),
      };
      Object.keys(data).forEach(
        (k) => data[k] == null || (data[k] == '' && delete data[k])
      );
      const params = new URLSearchParams(data).toString();
      try {
        const response = await fetch(`${server.url}/v1/Accounts/${accountSid}/Calls${ params ? '?' + params : ''}`, {
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
          node.error(`GetCalls failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error getting calls ${err.message}`;
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
  RED.nodes.registerType("get_calls", get_calls);
};
