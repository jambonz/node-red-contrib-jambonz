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

  /**
   * Live language/voice (and model) data for a vendor, proxied through a jambonz_auth config node
   * using the account API token. Falls through to the account's speech API
   * (GET .../SpeechCredentials/speech/supportedLanguagesAndVoices). The editor falls back to the
   * bundled static data when no server is configured or this call fails.
   */
  RED.httpAdmin.get('/_jambonz/speechData/:serverId/:vendor', (req, res) => {
    const conn = RED.nodes.getNode(req.params.serverId);
    if (conn && conn.credentials && conn.credentials.apiToken) {
      const url = RED.util.evaluateNodeProperty(conn.url, conn.urlType, conn, {});
      const accountSid = RED.util.evaluateNodeProperty(conn.credentials.accountSid, conn.accountSidType, conn, {});
      const apiToken = RED.util.evaluateNodeProperty(conn.credentials.apiToken, conn.apiTokenType, conn, {});
      if (!url || !accountSid || !apiToken) return res.sendStatus(404);
      const vendor = encodeURIComponent(req.params.vendor);
      const label = req.query.label ? `&label=${encodeURIComponent(req.query.label)}` : '';
      fetch(`${url}/v1/Accounts/${accountSid}/SpeechCredentials/speech/supportedLanguagesAndVoices?vendor=${vendor}&create_new=1${label}`, {
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

  RED.httpAdmin.get('/_jambonz/applications/:serverId', (req, res) => {
    const conn = RED.nodes.getNode(req.params.serverId);
    if (conn && conn.credentials && conn.credentials.apiToken) {
      const url =  RED.util.evaluateNodeProperty( conn.url, conn.urlType, conn, {});
      const apiToken =  RED.util.evaluateNodeProperty(conn.credentials.apiToken, conn.apiTokenType, conn, {});

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
