const {google, aws} = require('../data/tts');
const speechrec = require('../data/recognizer').google;
const dialogflow = require('../data/dialogflow');

module.exports = function(RED) {
  RED.httpAdmin.get('/googleTts', (req, res) => {
    res.send(google);
  });

  RED.httpAdmin.get('/awsTts', (req, res) => {
    res.send(aws);
  });


  RED.httpAdmin.get('/googleSpeech', (req, res) => {
    res.send(speechrec);
  });

  RED.httpAdmin.get('/dialogflow', (req, res) => {
    res.send(dialogflow);
  });
};
