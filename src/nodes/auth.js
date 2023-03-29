module.exports = function(RED) {
    function jambonz_auth(config) {
      RED.nodes.createNode(this, config);
      this.accountSid = config.accountSid;
      this.apiKey = config.apiKey;
      this.name = config.name;
      this.urlType = config.urlType
      if (this.urlType == 'str'){
        this.url = config.url;
      } else {
        this.url = config.urlType;
      }
    }
    
    RED.nodes.registerType('jambonz_auth', jambonz_auth, {
      credentials: {
        url: {type: 'text'},
        urlType: {},
        accountSid: {type: 'text'},
        apiToken: {type: 'text'}
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