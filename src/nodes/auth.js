module.exports = function(RED) {
    function jambonz_auth(config) {
      RED.nodes.createNode(this, config);
      this.name = config.name;
      this.url = config.url;
      this.urlType = config.urlType;
      this.accountSid = config.accountSid;
      this.accountSidType = config.accountSidType;
      this.apiToken = config.apiToken;
      this.apiTokenType = config.apiTokenType;
    }
    
    RED.nodes.registerType('jambonz_auth', jambonz_auth, {
      credentials: {
        url: {type: 'text'},
        urlType: {},
        accountSid: {type: 'text'},
        accountSidType: {},
        apiToken: {type: 'text'},
        apiTokenType: {}
      }
    });
}