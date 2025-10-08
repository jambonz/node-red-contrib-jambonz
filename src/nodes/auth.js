module.exports = function(RED) {
    function jambonz_auth(config) {
      RED.nodes.createNode(this, config);
      var node = this;
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

    function aws_auth(config) {
      RED.nodes.createNode(this, config);
      this.accessKey = config.accessKey;
      this.secretAccessKey = config.secretAccessKey;
    }
  
    RED.nodes.registerType('aws_auth', aws_auth, {
      credentials: {
        accessKey: {type: 'text'},
        secretAccessKey: {type: 'text'}
      }
    });
}