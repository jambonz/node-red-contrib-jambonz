const {fetch} = require('undici');
var {new_resolve} = require('./libs');

module.exports = function(RED) {
    function get_alerts(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const server = RED.nodes.getNode(config.server);
        const {accountSid, apiToken} = server.credentials;
        node.on('input', async (msg, send, done) => {
            const data = {
                page: await new_resolve(RED, config.page, config.pageType, node, msg),
                count: await new_resolve(RED, config.count, config.countType, node, msg),
                days: await new_resolve(RED, config.days, config.daysType, node, msg),
            }
            Object.keys(data).forEach((k) => data[k] == null || data[k] == '' && delete data[k]);
            const params = new URLSearchParams(data).toString()           
            try {
                const response = await fetch(`${server.url}/v1/Accounts/${accountSid}/Alerts?${params}`, {
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
                msg.payload = res.data;
                msg.total = res.total;
                msg.page_size = res.page_size;
                msg.page = res.page;
            } catch (err) {
                if (err.statusCode) {
                    node.error(`GetAlerts failed with ${err.statusCode}`);
                    msg.statusCode = err.statusCode;
                    msg.errorMessage = err.statusText;
                }
                else {
                    const errorMessage = `Error getting alerts ${err.message}`;
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
    RED.nodes.registerType('get_alerts', get_alerts);
}