const {fetch} = require('undici');
const {google, aws, microsoft, ibm, nuance} = require('../data/tts');
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

  RED.httpAdmin.get('/_jambonz/nuanceTts', (req, res) => {
    res.send(nuance);
  });

  RED.httpAdmin.get('/_jambonz/googleSpeech', (req, res) => {
    res.send(obj.google);
  });

  RED.httpAdmin.get('/_jambonz/awsSpeech', (req, res) => {
    res.send(obj.aws);
  });

  RED.httpAdmin.get('/_jambonz/deepgramSpeech', (req, res) => {
    res.send(obj.deepgram);
  });

  RED.httpAdmin.get('/_jambonz/ibmSpeech', (req, res) => {
    res.send(obj.ibm);
  });

  RED.httpAdmin.get('/_jambonz/microsoftSpeech', (req, res) => {
    res.send(obj.microsoft);
  });

  RED.httpAdmin.get('/_jambonz/nuanceSpeech', (req, res) => {
    res.send(obj.nuance);
  });

  RED.httpAdmin.get('/_jambonz/dialogflow', (req, res) => {
    res.send(dialogflow);
  });

  RED.httpAdmin.get('/_jambonz/applications/:serverId', (req, res) => {
    const conn = RED.nodes.getNode(req.params.serverId);
    if (conn && conn.credentials && conn.credentials.apiToken) {
      const { apiToken } = conn.credentials;
      const { url } = conn;
      fetch(`${url}/v1/Applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`
        },
        signal: AbortSignal.timeout(10000)
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Bad response');
        }
        res.send(await response.json());
      })
      .catch((error) => {
        res.status(500).send(error.message);
      });
    } else {
      res.sendStatus(404);
    }
  });
};
