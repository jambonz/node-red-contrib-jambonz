var awsData = require('../data/aws-tts');
var googleData = require('../data/google-tts');
var dialogflowData = require('../data/google-tts');

var mapGoogle = {};
var googleLanguageOptions = '';
googleData.forEach(function(l) {
  mapGoogle[l.code] = {
    name: l.name,
    voices: l.voices
  };
  googleLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
});

var mapDialogFlow = {};
var dialogFlowLanguageOptions = '';
dialogflowData.forEach(function(l) {
  mapGoogle[l.code] = {
    name: l.name,
    voices: l.voices
  };
  dialogFlowLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
});

var mapAws = {};
var awsLanguageOptions = '';
awsData.forEach(function(l) {
  mapAws[l.code] = {
    name: l.name,
    voices: l.voices
  };
  awsLanguageOptions += `<option value="${l.code}">${l.name}</option>`;
});

module.exports = {
  googleLanguageOptions,
  dialogFlowLanguageOptions,
  awsLanguageOptions,
  mapGoogle,
  mapAws,
  mapDialogFlow
};
