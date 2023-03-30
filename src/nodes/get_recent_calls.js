const bent = require('bent');
var {v_resolve} = require('./libs');

module.exports = function(RED) {
    function get_recent_calls(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const server = RED.nodes.getNode(config.server);
        const {accountSid, apiToken} = server.credentials;
        node.on('input', async(msg, send, done) => {
            const data = {
                direction: v_resolve(config.direction, config.directionType, this.context(), msg),
                trunk: v_resolve(config.trunk, config.trunkType, this.context(), msg),
                page: v_resolve(config.page, config.pageType, this.context(), msg),
                count: v_resolve(config.count, config.countType, this.context(), msg),
                days: v_resolve(config.days, config.daysType, this.context(), msg),
            }
            Object.keys(data).forEach((k) => data[k] == null || data[k] == '' && delete data[k]);
            const params = new URLSearchParams(data).toString();
            const req = bent(`${server.url}/v1/Accounts/${accountSid}/RecentCalls?${params}`, 'GET', 'json', {
                'Authorization': `Bearer ${apiToken}`
            });           
            try {
                const res = await req();
                msg.payload = res.data;
                msg.total = res.total;
                msg.page_size = res.page_size;
                msg.page = res.page;
            } catch (err) {
                if (err.statusCode) {
                    node.error(`GetRecentCalls failed with ${err.statusCode}`);
                    msg.statusCode = err.statusCode;
                }
                else {
                    node.error(`Error getting recent calls ${JSON.stringify(err)}`);
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
    RED.nodes.registerType('get_recent_calls', get_recent_calls);
}