var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve, v_text_resolve, doLCC, doCreateCall, doCreateMessage} = require('./libs')

module.exports = function(RED) {
    function get_alerts(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const server = RED.nodes.getNode(config.server);
        const {accountSid, apiToken} = server.credentials;
        node.on('input', async(msg, send, done) => {
            const data = {
                page: config.page,
                count : config.count,
                days : config.days
            }
            const params = new URLSearchParams(data).toString()
            const req = bent(`${server.url}/v1/Accounts/${accountSid}/Alerts?${params}`, 'GET', 'json', {
                'Authorization': `Bearer ${apiToken}`
            });           
            try {
                const res = await req();
                msg.payload = res.data
                msg.total = res.total
                msg.page_size = res.page_size
                msg.page = res.page
            } catch (err) {
                if (err.statusCode) {
                  node.error(`create-call failed with ${err.statusCode}`);
                  msg.statusCode = err.statusCode;
                }
                else {
                  node.error(`Error getting alerts ${JSON.stringify(err)}`);
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
      RED.nodes.registerType('get_alerts', get_alerts);
}