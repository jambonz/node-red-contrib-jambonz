const bent = require('bent');


const {google, aws, microsoft, ibm} = require('../data/tts');
const obj = require('../data/recognizer');
const dialogflow = require('../data/dialogflow');
module.exports = function(RED) {
  RED.httpAdmin.get('/_jambonz/googleTts', (req, res) => {
    res.send(google);
  });

  RED.httpAdmin.get('/_jambonz/awsTts', (req, res) => {
    res.send(aws);
  });

  RED.httpAdmin.get('/_jambonz/microsoftTts', (req, res) => {
    res.send(microsoft);
  });

  RED.httpAdmin.get('/_jambonz/ibmTts', (req, res) => {
    res.send(ibm);
  });

  RED.httpAdmin.get('/_jambonz/googleSpeech', (req, res) => {
    res.send(obj.google);
  });

  RED.httpAdmin.get('/_jambonz/awsSpeech', (req, res) => {
    res.send(obj.aws);
  });

  RED.httpAdmin.get('/_jambonz/dialogflow', (req, res) => {
    res.send(dialogflow);
  });

  RED.httpAdmin.get('/_jambonz/applications/:serverId', (req, res) => {
    var conn = RED.nodes.getNode(req.params.serverId);
    if (conn && conn.credentials) {
      const {accountSid, apiToken} = conn.credentials;
      const url = conn.url
      const getApps = bent(`${url}/v1/Applications`, 'GET', 'json', 200, {
      'Authorization': `Bearer ${apiToken}`
      });
      getApps()
      .then( (apps) =>{
          res.send(apps)
      })
    }
  });
};
