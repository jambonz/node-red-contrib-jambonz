const {fetch} = require('undici');
var {new_resolve} = require('./libs');

module.exports = function(RED) {
  function get_registrations(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    node.on('input', async (msg, send, done) => {
      const url = await new_resolve(RED, server.url, server.urlType, node, msg);
      const accountSid = await new_resolve(RED, server.credentials.accountSid, server.accountSidType, node, msg);
      const apiToken = await new_resolve(RED, server.credentials.apiToken, server.apiTokenType, node, msg);

      if (!url || !accountSid || !apiToken) {
        node.error(`invalid / missing credentials ${JSON.stringify(server.credentials)}`);
        send(msg);
        if (done) done();
        return;
      }

      // 'list' -> GET (returns user@realm strings)
      // 'details' -> POST with an array of usernames (empty array returns all with details)
      const endpoint = `${url}/v1/Accounts/${accountSid}/RegisteredSipUsers`;
      let opts;
      if (config.mode === 'details') {
        const raw = await new_resolve(RED, config.users, config.usersType, node, msg);
        let users = [];
        if (Array.isArray(raw)) users = raw;
        else if (typeof raw === 'string' && raw.length) users = raw.split(',').map((u) => u.trim()).filter((u) => u.length);
        opts = {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}`},
          body: JSON.stringify(users)
        };
      } else {
        opts = {method: 'GET', headers: {'Authorization': `Bearer ${apiToken}`}};
      }

      try {
        const response = await fetch(endpoint, opts);
        if (!response.ok) {
          const error = new Error('Bad response');
          error.statusCode = response.status;
          error.statusText = response.statusText;
          throw error;
        }
        msg.payload = await response.json();
      } catch (err) {
        if (err.statusCode) {
          node.error(`GetRegistrations failed with ${err.statusCode}`);
          msg.statusCode = err.statusCode;
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error getting registrations ${err.message}`;
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
  RED.nodes.registerType('get_registrations', get_registrations);
};
