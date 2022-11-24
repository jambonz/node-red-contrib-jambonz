var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
require('./http-helpers')(RED);
var {v_resolve} = require('./libs')

/** user auth */
module.exports = function(RED) {
    function userauth(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      node.on('input', function(msg) {
        var attemptedAuthentication = false;
        var auth = msg.authRequest;
        var authResponse = {};
        var ha1_string;
        if (config.ha1 && config.ha1.length) {
          ha1_string =  v_resolve(config.ha1, config.ha1Type, this.context(), msg);
          attemptedAuthentication = true;
          node.log(`user auth: validating user ${auth.username} domain ${auth.realm} based on hashed password`);
        }
        else if (config.password && config.password.length) {
          var password = v_resolve(config.password, config.passwordType, this.context(), msg);
          var ha1 = createHash('md5');
          ha1.update([auth.username, auth.realm, password].join(':'));
          ha1_string = ha1.digest('hex');
          attemptedAuthentication = true;
          node.log(`user auth: validating user ${auth.username} domain ${auth.realm} based on plaintext password`);
        }
        else {
          node.log('user auth: failing due to no password provided');
        }
  
        if (attemptedAuthentication) {
          var ha2 = createHash('md5');
          ha2.update([auth.method, auth.uri].join(':'));
          var response = createHash('md5');
          var responseParams = [
            ha1_string,
            auth.nonce
          ];
  
          if (auth.cnonce) {
            responseParams.push(auth.nc);
            responseParams.push(auth.cnonce);
          }
  
          if (auth.qop) {
            responseParams.push(auth.qop);
          }
  
          responseParams.push(ha2.digest('hex'));
          response.update(responseParams.join(':'));
  
          var calculated = response.digest('hex');
          if (calculated === auth.response) {
            Object.assign(authResponse, {status: 'ok'});
          }
          else {
            Object.assign(authResponse, {status: 'fail', msg: 'incorrect password'});
          }
        }
        else {
          Object.assign(authResponse, {status: 'fail', msg: 'invalid domain or username'});
        }
  
        msg.authResponse = authResponse;
        node.send(msg);
      });
    }
    RED.nodes.registerType('user auth', userauth);

    function jambonz_auth(config) {
      RED.nodes.createNode(this, config);
      this.url = config.url;
      this.accountSid = config.accountSid;
      this.apiKey = config.apiKey;
    }
    RED.nodes.registerType('jambonz_auth', jambonz_auth, {
      credentials: {
        url: {type: 'text'},
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