const {google, aws} = require('../data/tts');
const speechrec = require('../data/tts').google;

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
};
