const {google, aws} = require('../data/tts');
const obj = require('../data/recognizer');
const dialogflow = require('../data/dialogflow');

module.exports = function(RED) {
  RED.httpAdmin.get('/googleTts', (req, res) => {
    res.send(google);
  });

  RED.httpAdmin.get('/awsTts', (req, res) => {
    res.send(aws);
  });


  RED.httpAdmin.get('/googleSpeech', (req, res) => {
    res.send(obj.google);
  });

  RED.httpAdmin.get('/awsSpeech', (req, res) => {
    res.send(obj.aws);
  });

  RED.httpAdmin.get('/dialogflow', (req, res) => {
    res.send(dialogflow);
  });
};
