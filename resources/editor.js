  let mapGoogle = {};
  let mapAws = {};
  let mapMicrosoft = {};
  let mapIbm = {};
  let mapNuance = {};
  let googleLanguageOptions = '';
  let awsLanguageOptions = '';
  let microsoftLanguageOptions = '';
  let ibmLanguageOptions = '';
  let nuanceLanguageOptions = '';
  let sttLanguagesGoogle = '';
  let sttLanguagesAws = '';
  let sttLanguagesDeepgram = '';
  let sttLanguagesIbm = '';
  let sttLanguagesMicrosoft = '';
  let sttLanguagesNuance = '';
  let mapDialogflow = {};
  let dialogFlowOptions = '';

// Get TTS Providers
  var googleUrl = '_jambonz/googleTts';
  $.getJSON(googleUrl, function (data) {
    data.forEach(function(l) {
      mapGoogle[l.code] = {
        name: l.name,
        voices: l.voices
      };
      googleLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var awsUrl = '_jambonz/awsTts';
  $.getJSON(awsUrl, function (data) {
    data.forEach(function(l) {
      mapAws[l.code] = {
        name: l.name,
        voices: l.voices
      };
      awsLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var microsoftUrl = '_jambonz/microsoftTts';
  $.getJSON(microsoftUrl, function (data) {
    data.forEach(function(l) {
      mapMicrosoft[l.code] = {
        name: l.name,
        voices: l.voices
      };
      microsoftLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var ibmUrl = '_jambonz/ibmTts';
  $.getJSON(ibmUrl, function (data) {
    data.forEach(function(l) {
      mapIbm[l.code] = {
        name: l.name,
        voices: l.voices
      };
      ibmLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var nuanceUrl = '_jambonz/nuanceTts';
  $.getJSON(nuanceUrl, function (data) {
    data.forEach(function(l) {
      mapNuance[l.code] = {
        name: l.name,
        voices: l.voices
      };
      nuanceLanguageOptions += `<option value="${l.code}">${l.name}</option>`;        
    });
  });

// GET STT Providers
  var googleSttUrl =  '_jambonz/googleSpeech';
  $.getJSON(googleSttUrl, function (data) {
    data.forEach(function(l) {
      sttLanguagesGoogle += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var awsSttUrl =  '_jambonz/awsSpeech';
  $.getJSON(awsSttUrl, function (data) {
    data.forEach(function(l) {
      sttLanguagesAws += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var deepgramSttUrl =  '_jambonz/deepgramSpeech';
  $.getJSON(deepgramSttUrl, function (data) {
    data.forEach(function(l) {
      sttLanguagesDeepgram += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var ibmSttUrl =  '_jambonz/ibmSpeech';
  $.getJSON(ibmSttUrl, function (data) {
    data.forEach(function(l) {
      sttLanguagesIbm += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var microsoftSttUrl =  '_jambonz/microsoftSpeech';
  $.getJSON(microsoftSttUrl, function (data) {
    data.forEach(function(l) {
      sttLanguagesMicrosoft += `<option value="${l.code}">${l.name}</option>`;        
    });
  });
  var nuanceSttUrl =  '_jambonz/nuanceSpeech';
  $.getJSON(nuanceSttUrl, function (data) {
    data.forEach(function(l) {
      sttLanguagesNuance += `<option value="${l.code}">${l.name}</option>`;        
    });
  });



// Get Bot providers
  
  var dialogflowUrl = '_jambonz/dialogflow';
  $.getJSON(dialogflowUrl, function (data) {
    data.forEach(function(l) {
      mapDialogflow[l.code] = l.name;
      dialogFlowOptions += `<option value="${l.code}">${l.name}</option>`;        
    });
  });



  function testCredentials() {
    let baseUrl
    const accountSid =  $("#node-config-input-accountSid").val();
    const token =  $("#node-config-input-apiToken").val();
    const status = $("#node-config-test-status");
    status.text('');
    if ($("#node-config-input-urlType").val() == 'str'){
      baseUrl = $("#node-config-input-url").val();
    } else {
      baseUrl = $("#node-config-input-urlType").val();
    }
    baseUrlProtocol = baseUrl.split(':')[0]
    if (document.location.protocol == 'https:' && baseUrlProtocol == 'http'){
      status.text('Cannot check https API from http editor');
    } else{
      $.ajax({
        url: `${baseUrl}/v1/Accounts/${accountSid}/ApiKeys`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        dataType: 'json',
        timeout: 500,
        error: (err) => {
          status.text('Failed');
          console.log(err);
        },
        success: (res) => {
          if (Array.isArray(res)) status.text('Success!');
          else status.text('Failed');
          console.log(`response from fetch of api keys: ${JSON.stringify(res)}`);
        }
      });
    }
  }

  function prepareSttControls(node) {
    var vendorElem = $('#node-input-transcriptionvendor');
    var languageElem = $('#node-input-recognizerlang');
    var mixtypeElem = $('#node-input-mixtype');

    console.log('entering prepareSttControls');
    
    var setTranscriptionLanguage = function(vendor) {
      console.log(`setting transcription vendor to ${vendor}`);
      languageElem.find('option').remove();
      switch (vendor) {
        case 'google':
          languageElem.append('<option value="default">--application default--</option>');
          languageElem.append(sttLanguagesGoogle);
          $('#google-stt-options').show();
          $('#aws-stt-options').hide();
          $('#interim').show();
          if (node.mixtype === 'stereo') $('#stt-identify-channels').show();
          else  $('#stt-identify-channels').hide();
          break;
        case 'aws':
          languageElem.append('<option value="default">--application default--</option>');
          languageElem.append(sttLanguagesAws);
          $('#google-stt-options').hide();
          $('#aws-stt-options').show();
          $('#interim').show();
          if (node.mixtype === 'stereo') $('#stt-identify-channels').show();
          else  $('#stt-identify-channels').hide();
          break
        case 'deepgram':
          languageElem.append('<option value="default">--application default--</option>');
          languageElem.append(sttLanguagesDeepgram);
          $('#google-stt-options').hide();
          $('#aws-stt-options').show();
          $('#interim').hide();
          if (node.mixtype === 'stereo') $('#stt-identify-channels').show();
          else  $('#stt-identify-channels').hide();
          break
        case 'ibm':
          languageElem.append('<option value="default">--application default--</option>');
          languageElem.append(sttLanguagesIbm);
          $('#google-stt-options').hide();
          $('#aws-stt-options').hide();
          $('#interim').show();
          if (node.mixtype === 'stereo') $('#stt-identify-channels').show();
          else  $('#stt-identify-channels').hide();
          break
        case 'microsoft':
          languageElem.append('<option value="default">--application default--</option>');
          languageElem.append(sttLanguagesMicrosoft);
          $('#google-stt-options').hide();
          $('#aws-stt-options').hide();
          $('#interim').show();
          if (node.mixtype === 'stereo') $('#stt-identify-channels').show();
          else  $('#stt-identify-channels').hide();
          break
        case 'nuance':
          languageElem.append('<option value="default">--application default--</option>');
          languageElem.append(sttLanguagesNuance);
          $('#google-stt-options').hide();
          $('#aws-stt-options').hide();
          $('#interim').show();
          if (node.mixtype === 'stereo') $('#stt-identify-channels').show();
          else  $('#stt-identify-channels').hide();
          break
        default:
          languageElem.append('<option value="default">--application default--</option>');
          node.transcriptionvendor = 'default';
          $('#google-stt-options').hide();
          $('#aws-stt-options').hide();
          $('#stt-identify-channels').hide();
          $('#interim').hide();
          break;
      }
    }

    var onVendorChanged = function() {
      var vendor = vendorElem.find(':selected').val();
      console.log(`stt vendor changed to ${node.transcriptionvendor}`);
      setTranscriptionLanguage(vendor);
      if (vendor === 'default') node.recognizerlang = 'default';
      console.log(`initializing transcription language to ${node.recognizerlang}`);
      languageElem.val(node.recognizerlang);
    }
  
    var onLangChanged = function() {
      var lang = languageElem.find(':selected').val();
      console.log(`lang dropdown changed to ${lang}`);
      node.recognizerlang = lang;
    }

    var onMixtypeChange = function() {
      var mix = mixtypeElem.find(':selected').val();
      console.log(`mixtype is now ${mix}`);
      if (mix === 'stereo') $('#stt-identify-channels').show();
      else  $('#stt-identify-channels').hide();
    }

    vendorElem.change(onVendorChanged);
    languageElem.change(onLangChanged);
    mixtypeElem.change(onMixtypeChange);

    console.log(`initializing transcription vendor to ${node.transcriptionvendor}`);
    vendorElem.val(node.transcriptionvendor);

  }

  function prepareTtsControls(node) {
    var vendorElem = $('#node-input-vendor');
    var langElem = $('#node-input-lang');
    var xlangElem = $('#node-input-xlang');
    var voiceElem = $('#node-input-voice');
    var xvoiceElem = $('#node-input-xvoice');
  
    console.log(`oneditprepare tts vendor: ${node.vendor}, lang: ${node.lang}, voice: ${node.voice}`);

    var onVendorChanged = function() {
      node.vendor = vendorElem.val();
      console.log(`tts vendor changed to ${node.vendor}`);
      setLanguage(node.vendor);
    }
    var setLanguage = function(v) {
      xlangElem.find('option').remove();
      xvoiceElem.find('option').remove();

      switch (v) {
        case 'default': 
          xlangElem.append('<option value="default" selected>--application default--</option>');
          xvoiceElem.append('<option value="default" selected>--application default--</option>');
          langElem.val('default');
          voiceElem.val('default');
          break;

        case 'google':
          xlangElem.append(googleLanguageOptions);
          break;

        case 'aws':
          xlangElem.append(awsLanguageOptions);
          break;
        case 'microsoft':
          xlangElem.append(microsoftLanguageOptions);
         break;
        case 'ibm':
         xlangElem.append(ibmLanguageOptions);
        break;
        case 'nuance':
         xlangElem.append(nuanceLanguageOptions);
        break;
      }
      console.log(`installed language choices for ${v}`);
      xlangElem.val(langElem.val());
    }
    var onLangChanged = function() {
      console.log(`lang edit changed to ${langElem.val()}`);
    }
    var onXLangChanged = function() {
      var lang = xlangElem.find(':selected').val();
      console.log(`lang dropdown changed to ${lang}`);
      node.lang = lang;
      langElem.val(node.lang);
      setVoice(node.vendor, node.lang)
    }
    var setVoice = function(vendor, lang) {
      xvoiceElem.find('option').remove();

      console.log(`installing voices for ${vendor} ${lang}`);
      switch (vendor) {
        case 'default':
          xvoiceElem.append('<option value="default" selected>--application default--</option>');
          break;
        case 'google':
          var obj =  mapGoogle[lang]
          if (obj) {
            var options = '';
            for (var i = 0; i < obj.voices.length; i++) {
              if (i) options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
              else options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
            }
            xvoiceElem.append(options);
          }
          break;
        case 'aws':
          var obj =  mapAws[lang]
          if (obj) {
            var options = '';
            for (var i = 0; i < obj.voices.length; i++) {
              if (i) options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
              else options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
            }
            xvoiceElem.append(options);
          }
          break; 
        case 'microsoft':
          var obj =  mapMicrosoft[lang]
          if (obj) {
            var options = '';
            for (var i = 0; i < obj.voices.length; i++) {
              if (i) options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
              else options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
            }
            xvoiceElem.append(options);
          }
          break;
        case 'ibm':
          var obj =  mapIbm[lang]
          if (obj) {
            var options = '';
            for (var i = 0; i < obj.voices.length; i++) {
              if (i) options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
              else options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
            }
            xvoiceElem.append(options);
          }
        break;
        case 'nuance':
          var obj =  mapNuance[lang]
          if (obj) {
            var options = '';
            for (var i = 0; i < obj.voices.length; i++) {
              if (i) options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
              else options += `<option value="${obj.voices[i].value}">${obj.voices[i].name}</option>`;
            }
            xvoiceElem.append(options);
          }
          break;
      }
      console.log(`installed voice choices for ${vendor} ${lang}`);
      if (voiceElem.val()) xvoiceElem.val(voiceElem.val());
    }
    var onVoiceChanged = function() {
      console.log(`voice edit changed to ${voiceElem.val()}`);
      xvoiceElem.val(voiceElem.val());
    }
    var onXVoiceChanged = function() {
      var voice = xvoiceElem.find(':selected').val();
      if (voice) {
        node.voice = voice;
        console.log(`voice dropdown changed to ${voice}`);
        voiceElem.val(voice);
      }
    }

    vendorElem.change(onVendorChanged);
    langElem.change(onLangChanged);
    xlangElem.change(onXLangChanged);
    voiceElem.change(onVoiceChanged);
    xvoiceElem.change(onXVoiceChanged);
  }









