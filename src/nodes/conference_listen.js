const {fetch} = require('undici');
var {new_resolve} = require('./libs');

module.exports = function(RED) {
  /** conference_listen - start/stop a conference-level audio fork to a websocket */
  function conference_listen(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    node.on('input', async (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments); };
      const url = await new_resolve(RED, server.url, server.urlType, node, msg);
      const accountSid = await new_resolve(RED, server.credentials.accountSid, server.accountSidType, node, msg);
      const apiToken = await new_resolve(RED, server.credentials.apiToken, server.apiTokenType, node, msg);
      const confName = await new_resolve(RED, config.confName, config.confNameType, node, msg);

      if (!url || !accountSid || !apiToken || !confName) {
        node.error('invalid / missing credentials or conference name, skipping conference_listen node');
        send(msg);
        if (done) done();
        return;
      }

      const scope = await new_resolve(RED, config.scope, config.scopeType, node, msg);
      const start = config.action !== 'stop';
      const base = `${url}/v1/Accounts/${accountSid}/Conferences/${encodeURIComponent(confName)}/listen`;
      let endpoint = base;
      let opts;
      if (start) {
        const wsUrl = await new_resolve(RED, config.wsUrl, config.wsUrlType, node, msg);
        const body = {url: wsUrl};
        if (scope) body.scope = scope;
        opts = {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}`},
          body: JSON.stringify(body)
        };
      } else {
        if (scope) endpoint = `${base}?scope=${encodeURIComponent(scope)}`;
        opts = {method: 'DELETE', headers: {'Authorization': `Bearer ${apiToken}`}};
      }

      try {
        const response = await fetch(endpoint, opts);
        msg.statusCode = response.status;
        if (!response.ok) {
          const error = new Error('Bad response');
          error.statusCode = response.status;
          error.statusText = response.statusText;
          throw error;
        }
        const contentType = response.headers.get('content-type');
        msg.payload = contentType && contentType.includes('application/json') ?
          await response.json() : await response.text();
      } catch (err) {
        if (err.statusCode) {
          node.error(`ConferenceListen failed with ${err.statusCode}`);
          msg.errorMessage = err.statusText;
        } else {
          const errorMessage = `Error invoking conference listen ${err.message}`;
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
  RED.nodes.registerType('conference_listen', conference_listen);
};
