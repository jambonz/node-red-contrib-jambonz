// AUTO-GENERATED from @jambonz/schema v0.4.13 by scripts/generate-speech-schema.js
// DO NOT EDIT BY HAND. Regenerate with: npm run gen:speech
(function (root) {
  var schema = {
  "meta": {
    "schemaVersion": "0.4.13",
    "generatedBy": "scripts/generate-speech-schema.js"
  },
  "synthVendors": [
    "google",
    "aws",
    "microsoft",
    "elevenlabs",
    "cartesia",
    "fishaudio",
    "gradium",
    "nineninesix",
    "deepgram",
    "deepgramflux",
    "ibm",
    "nvidia",
    "wellsaid",
    "whisper",
    "custom"
  ],
  "recVendors": [
    "google",
    "aws",
    "microsoft",
    "deepgram",
    "ibm",
    "nvidia",
    "soniox",
    "xai",
    "modulate",
    "assemblyai",
    "speechmatics",
    "openai",
    "houndify",
    "gladia",
    "elevenlabs",
    "custom"
  ],
  "synthesizer": [
    {
      "key": "vendor",
      "control": "text",
      "description": "The TTS vendor to use. Must match a vendor configured in the jambonz platform."
    },
    {
      "key": "label",
      "control": "text",
      "description": "An optional label identifying a specific credential set for this vendor. Used when multiple credentials are configured for the same vendor on the jambonz platform."
    },
    {
      "key": "language",
      "control": "text",
      "description": "The language code for speech synthesis, in BCP-47 format."
    },
    {
      "key": "voice",
      "control": "voice",
      "description": "The voice to use for synthesis. Format varies by vendor: Google uses voice names like 'en-US-Wavenet-D', AWS Polly uses names like 'Joanna', but ElevenLabs and Cartesia require voice IDs (alphanumeric strings like 'EXAVITQu4vr4xnSDxMaL'), not human-readable names. Some vendors accept an object for more complex voice configuration."
    },
    {
      "key": "fallbackVendor",
      "control": "text",
      "description": "A backup TTS vendor to use if the primary vendor fails or is unavailable."
    },
    {
      "key": "fallbackLabel",
      "control": "text",
      "description": "Credential label for the fallback vendor."
    },
    {
      "key": "fallbackLanguage",
      "control": "text",
      "description": "Language code to use with the fallback vendor."
    },
    {
      "key": "fallbackVoice",
      "control": "voice",
      "description": "Voice to use with the fallback vendor."
    },
    {
      "key": "engine",
      "control": "enum",
      "enum": [
        "standard",
        "neural",
        "generative",
        "long-form"
      ],
      "description": "The synthesis engine tier to use. Availability depends on the vendor."
    },
    {
      "key": "gender",
      "control": "enum",
      "enum": [
        "MALE",
        "FEMALE",
        "NEUTRAL"
      ],
      "description": "Preferred voice gender. Used by some vendors (e.g. Google) when a specific voice is not specified."
    },
    {
      "key": "options",
      "control": "json",
      "description": "Vendor-specific options passed through to the TTS provider. The structure depends on the vendor being used."
    }
  ],
  "recognizer": {
    "common": [
      {
        "key": "vendor",
        "control": "text",
        "description": "The STT vendor to use. Must match a vendor configured in the jambonz platform."
      },
      {
        "key": "label",
        "control": "text",
        "description": "An optional label identifying a specific credential set for this vendor. Used when multiple credentials are configured for the same vendor."
      },
      {
        "key": "language",
        "control": "text",
        "description": "The language code for speech recognition, in BCP-47 format."
      },
      {
        "key": "fallbackVendor",
        "control": "text",
        "description": "A backup STT vendor to use if the primary vendor fails or is unavailable."
      },
      {
        "key": "fallbackLabel",
        "control": "text",
        "description": "Credential label for the fallback vendor."
      },
      {
        "key": "fallbackLanguage",
        "control": "text",
        "description": "Language code to use with the fallback vendor."
      },
      {
        "key": "autogeneratePrompt",
        "control": "bool",
        "description": "If true, automatically generate a prompt for the STT vendor based on context (e.g. TTS voice, language). Supported by vendors that accept prompts for recognition guidance."
      },
      {
        "key": "hints",
        "control": "hintsList",
        "description": "An array of words or phrases that the recognizer should favor. Each item can be a plain string or an object with 'phrase' and optional 'boost' properties."
      },
      {
        "key": "hintsBoost",
        "control": "number",
        "description": "A boost factor for hint words. Higher values increase the likelihood of recognizing hinted words. Vendor-specific range."
      },
      {
        "key": "altLanguages",
        "control": "list",
        "description": "Additional languages the recognizer should listen for simultaneously. Enables multilingual recognition."
      },
      {
        "key": "profanityFilter",
        "control": "bool",
        "description": "If true, the vendor will attempt to filter profanity from transcription results."
      },
      {
        "key": "interim",
        "control": "bool",
        "description": "If true, return interim (partial) transcription results as they become available, before the utterance is complete."
      },
      {
        "key": "singleUtterance",
        "control": "bool",
        "description": "If true, recognition stops after the first complete utterance is detected."
      },
      {
        "key": "dualChannel",
        "control": "bool",
        "description": "If true, send separate audio channels for each call leg (caller and callee) to the recognizer."
      },
      {
        "key": "separateRecognitionPerChannel",
        "control": "bool",
        "description": "If true, perform independent recognition on each audio channel. Requires dualChannel."
      },
      {
        "key": "punctuation",
        "control": "bool",
        "description": "If true, enable automatic punctuation in transcription results."
      },
      {
        "key": "enhancedModel",
        "control": "bool",
        "description": "If true, use an enhanced (premium) recognition model if available from the vendor."
      },
      {
        "key": "words",
        "control": "bool",
        "description": "If true, include word-level timing information in transcription results."
      },
      {
        "key": "diarization",
        "control": "bool",
        "description": "If true, enable speaker diarization to identify different speakers in the audio."
      },
      {
        "key": "diarizationMinSpeakers",
        "control": "number",
        "description": "Minimum number of speakers expected. Used to guide the diarization algorithm."
      },
      {
        "key": "diarizationMaxSpeakers",
        "control": "number",
        "description": "Maximum number of speakers expected. Used to guide the diarization algorithm."
      },
      {
        "key": "interactionType",
        "control": "enum",
        "enum": [
          "unspecified",
          "discussion",
          "presentation",
          "phone_call",
          "voicemail",
          "voice_search",
          "voice_command",
          "dictation"
        ],
        "description": "A hint to the recognizer about the type of interaction, which can improve accuracy."
      },
      {
        "key": "naicsCode",
        "control": "number",
        "description": "North American Industry Classification System code. Some vendors use this to improve domain-specific accuracy."
      },
      {
        "key": "identifyChannels",
        "control": "bool",
        "description": "If true, identify and label which channel each transcription segment came from."
      },
      {
        "key": "vocabularyName",
        "control": "text",
        "description": "Name of a custom vocabulary resource configured at the vendor for improved recognition of specialized terms."
      },
      {
        "key": "vocabularyFilterName",
        "control": "text",
        "description": "Name of a vocabulary filter configured at the vendor for masking or removing specific words."
      },
      {
        "key": "filterMethod",
        "control": "enum",
        "enum": [
          "remove",
          "mask",
          "tag"
        ],
        "description": "How filtered vocabulary words should be handled in the transcript."
      },
      {
        "key": "model",
        "control": "text",
        "description": "The specific recognition model to use. Model names are vendor-specific."
      },
      {
        "key": "outputFormat",
        "control": "enum",
        "enum": [
          "simple",
          "detailed"
        ],
        "description": "The level of detail in recognition results."
      },
      {
        "key": "profanityOption",
        "control": "enum",
        "enum": [
          "masked",
          "removed",
          "raw"
        ],
        "description": "How profanity should be handled in results."
      },
      {
        "key": "requestSnr",
        "control": "bool",
        "description": "If true, request signal-to-noise ratio information in results."
      },
      {
        "key": "initialSpeechTimeoutMs",
        "control": "number",
        "description": "Time in milliseconds to wait for initial speech before timing out."
      },
      {
        "key": "azureServiceEndpoint",
        "control": "text",
        "description": "Custom Azure Speech Services endpoint URL. Only applies when vendor is 'microsoft'."
      },
      {
        "key": "azureSttEndpointId",
        "control": "text",
        "description": "Azure custom speech endpoint ID for using a custom-trained model. Only applies when vendor is 'microsoft'."
      },
      {
        "key": "asrDtmfTerminationDigit",
        "control": "text",
        "description": "A DTMF digit that terminates speech recognition when pressed."
      },
      {
        "key": "asrTimeout",
        "control": "number",
        "description": "Maximum time in seconds to wait for a complete recognition result."
      },
      {
        "key": "fastRecognitionTimeout",
        "control": "number",
        "description": "Timeout in seconds for fast recognition mode. Shorter timeout for quick responses."
      },
      {
        "key": "minConfidence",
        "control": "number",
        "min": 0,
        "max": 1,
        "description": "Minimum confidence score (0-1) required to accept a recognition result. Results below this threshold are discarded."
      }
    ],
    "vad": [
      {
        "key": "enable",
        "control": "bool",
        "description": "Whether to enable voice activity detection."
      },
      {
        "key": "voiceMs",
        "control": "number",
        "description": "Duration of voice activity (in milliseconds) required before speech is considered to have started."
      },
      {
        "key": "silenceMs",
        "control": "number",
        "description": "Duration of silence (in milliseconds) required before speech is considered to have ended."
      },
      {
        "key": "strategy",
        "control": "text",
        "description": "The VAD strategy to use."
      },
      {
        "key": "mode",
        "control": "number",
        "min": 0,
        "max": 3,
        "description": "WebRTC VAD aggressiveness mode (0-3). Higher values are more aggressive at filtering non-speech. Only applies when vendor is 'webrtc'."
      },
      {
        "key": "vendor",
        "control": "enum",
        "enum": [
          "webrtc",
          "silero"
        ],
        "description": "The VAD engine to use."
      },
      {
        "key": "threshold",
        "control": "number",
        "min": 0,
        "max": 1,
        "description": "Speech detection confidence threshold for Silero VAD. Value between 0 and 1, where higher values require greater confidence. Only applies when vendor is 'silero'."
      },
      {
        "key": "speechPadMs",
        "control": "number",
        "description": "Padding in milliseconds added before and after detected speech segments. Prevents clipping utterance boundaries. Only applies when vendor is 'silero'."
      }
    ],
    "vendorMap": {
      "deepgram": "deepgramOptions",
      "google": "googleOptions",
      "aws": "awsOptions",
      "microsoft": "azureOptions",
      "ibm": "ibmOptions",
      "nvidia": "nvidiaOptions",
      "soniox": "sonioxOptions",
      "xai": "xaiOptions",
      "modulate": "modulateOptions",
      "assemblyai": "assemblyAiOptions",
      "speechmatics": "speechmaticsOptions",
      "openai": "openaiOptions",
      "houndify": "houndifyOptions",
      "gladia": "gladiaOptions",
      "elevenlabs": "elevenlabsOptions",
      "custom": "customOptions"
    },
    "vendorOptions": {
      "deepgram": [
        {
          "key": "deepgramSttUri",
          "control": "text",
          "description": "Custom Deepgram STT endpoint URI."
        },
        {
          "key": "deepgramSttUseTls",
          "control": "bool",
          "description": "Whether to use TLS when connecting to the Deepgram STT endpoint."
        },
        {
          "key": "apiKey",
          "control": "text",
          "description": "Deepgram API key. Overrides the key configured in jambonz."
        },
        {
          "key": "tier",
          "control": "text",
          "description": "Deepgram model tier."
        },
        {
          "key": "model",
          "control": "text",
          "description": "Deepgram model name (e.g. 'nova-2', 'nova-2-general')."
        },
        {
          "key": "customModel",
          "control": "text",
          "description": "ID of a custom-trained Deepgram model."
        },
        {
          "key": "version",
          "control": "text",
          "description": "Model version."
        },
        {
          "key": "punctuate",
          "control": "bool",
          "description": "Enable automatic punctuation."
        },
        {
          "key": "smartFormatting",
          "control": "bool",
          "description": "Enable Deepgram smart formatting (dates, numbers, etc.)."
        },
        {
          "key": "noDelay",
          "control": "bool",
          "description": "Disable Deepgram's internal buffering for lower latency."
        },
        {
          "key": "profanityFilter",
          "control": "bool",
          "description": "Filter profanity from transcripts."
        },
        {
          "key": "redact",
          "control": "enum",
          "enum": [
            "pci",
            "numbers",
            "true",
            "ssn"
          ],
          "description": "Redact sensitive information from transcripts."
        },
        {
          "key": "diarize",
          "control": "bool",
          "description": "Enable speaker diarization."
        },
        {
          "key": "diarizeVersion",
          "control": "text",
          "description": "Diarization model version."
        },
        {
          "key": "ner",
          "control": "bool",
          "description": "Enable named entity recognition."
        },
        {
          "key": "multichannel",
          "control": "bool",
          "description": "Enable multichannel processing."
        },
        {
          "key": "alternatives",
          "control": "number",
          "description": "Number of alternative transcripts to return."
        },
        {
          "key": "numerals",
          "control": "bool",
          "description": "Convert spoken numbers to digits."
        },
        {
          "key": "search",
          "control": "list",
          "description": "Terms to search for in the transcript."
        },
        {
          "key": "replace",
          "control": "list",
          "description": "Terms to replace in the transcript."
        },
        {
          "key": "keywords",
          "control": "list",
          "description": "Keywords to boost recognition for."
        },
        {
          "key": "keyterms",
          "control": "list",
          "description": "Key terms to boost recognition for."
        },
        {
          "key": "endpointing",
          "control": "text",
          "description": "Endpointing sensitivity. Boolean to enable/disable, or number of milliseconds."
        },
        {
          "key": "utteranceEndMs",
          "control": "number",
          "description": "Milliseconds of silence to detect end of utterance."
        },
        {
          "key": "shortUtterance",
          "control": "bool",
          "description": "Optimize for short utterances."
        },
        {
          "key": "vadTurnoff",
          "control": "number",
          "description": "Milliseconds of silence before VAD turns off."
        },
        {
          "key": "tag",
          "control": "text",
          "description": "Tag to associate with the request for tracking."
        },
        {
          "key": "fillerWords",
          "control": "bool",
          "description": "Include filler words (um, uh) in transcript."
        },
        {
          "key": "eotThreshold",
          "control": "number",
          "description": "End-of-turn confidence threshold (0-1)."
        },
        {
          "key": "eotTimeoutMs",
          "control": "number",
          "description": "End-of-turn timeout in milliseconds."
        },
        {
          "key": "mipOptOut",
          "control": "bool",
          "description": "Opt out of Deepgram's model improvement program."
        },
        {
          "key": "entityPrompt",
          "control": "text",
          "description": "Prompt to guide entity detection."
        },
        {
          "key": "eagerEotThreshold",
          "control": "number",
          "description": "Eager end-of-turn threshold for faster response."
        },
        {
          "key": "languageHints",
          "control": "list",
          "description": "Language hints for Deepgram Flux Multilingual. BCP-47 codes (e.g. 'en', 'es', 'fr'). Biases transcription toward specified languages."
        }
      ],
      "google": [
        {
          "key": "mode",
          "control": "enum",
          "enum": [
            "VERBATIM",
            "SMART"
          ],
          "description": "Gemini transcription style; applies only to the gemini models. VERBATIM transcribes as spoken; SMART cleans up disfluencies and applies formatting."
        },
        {
          "key": "customVocabulary",
          "control": "list",
          "description": "Up to 1000 terms, acronyms, brand names or proper nouns to bias recognition towards; applies only to the gemini models."
        },
        {
          "key": "serviceVersion",
          "control": "enum",
          "enum": [
            "v1",
            "v2"
          ],
          "description": "Cloud Speech-to-Text API version. Ignored by the gemini models, which are a different API."
        },
        {
          "key": "recognizerId",
          "control": "text",
          "description": "ID of a Google Speech recognizer resource (v2 only)."
        },
        {
          "key": "parentPath",
          "control": "text",
          "description": "Parent resource path for the Cloud Speech-to-Text v2 recognizer resource, e.g. 'projects/{project}/locations/{location}'. A location other than global also routes the request to that region's endpoint."
        },
        {
          "key": "speechStartTimeoutMs",
          "control": "number",
          "description": "Timeout in milliseconds to wait for speech to start."
        },
        {
          "key": "speechEndTimeoutMs",
          "control": "number",
          "description": "Timeout in milliseconds to detect end of speech."
        },
        {
          "key": "enableVoiceActivityEvents",
          "control": "bool",
          "description": "Enable voice activity detection events."
        },
        {
          "key": "transcriptNormalization",
          "control": "list",
          "description": "Array of transcript normalization rules."
        }
      ],
      "aws": [
        {
          "key": "accessKey",
          "control": "text",
          "description": "AWS access key ID. Overrides credentials configured in jambonz."
        },
        {
          "key": "secretKey",
          "control": "text",
          "description": "AWS secret access key."
        },
        {
          "key": "securityToken",
          "control": "text",
          "description": "AWS temporary security token (for STS/assumed roles)."
        },
        {
          "key": "region",
          "control": "text",
          "description": "AWS region for the Transcribe service."
        },
        {
          "key": "vocabularyName",
          "control": "text",
          "description": "Name of a custom vocabulary to use."
        },
        {
          "key": "vocabularyFilterName",
          "control": "text",
          "description": "Name of a vocabulary filter to apply."
        },
        {
          "key": "vocabularyFilterMethod",
          "control": "enum",
          "enum": [
            "remove",
            "mask",
            "tag"
          ],
          "description": "How filtered vocabulary words should be handled."
        },
        {
          "key": "languageModelName",
          "control": "text",
          "description": "Name of a custom language model."
        },
        {
          "key": "piiEntityTypes",
          "control": "list",
          "description": "PII entity types to identify (e.g. 'BANK_ACCOUNT_NUMBER', 'CREDIT_DEBIT_NUMBER')."
        },
        {
          "key": "piiIdentifyEntities",
          "control": "bool",
          "description": "Enable PII entity identification."
        }
      ],
      "microsoft": [
        {
          "key": "speechSegmentationSilenceTimeoutMs",
          "control": "number",
          "description": "Silence timeout in milliseconds for speech segmentation."
        },
        {
          "key": "postProcessing",
          "control": "text",
          "description": "Post-processing mode for transcription results."
        },
        {
          "key": "audioLogging",
          "control": "bool",
          "description": "Enable audio logging for diagnostics."
        },
        {
          "key": "languageIdMode",
          "control": "enum",
          "enum": [
            "AtStart",
            "Continuous"
          ],
          "description": "Language identification mode when using multiple languages."
        },
        {
          "key": "speechRecognitionMode",
          "control": "enum",
          "enum": [
            "CONVERSATION",
            "DICTATION",
            "INTERACTIVE"
          ],
          "description": "Speech recognition mode optimized for the interaction type."
        }
      ],
      "ibm": [
        {
          "key": "sttApiKey",
          "control": "text",
          "description": "IBM STT API key. Overrides credentials configured in jambonz."
        },
        {
          "key": "sttRegion",
          "control": "text",
          "description": "IBM STT region."
        },
        {
          "key": "ttsApiKey",
          "control": "text",
          "description": "IBM TTS API key."
        },
        {
          "key": "ttsRegion",
          "control": "text",
          "description": "IBM TTS region."
        },
        {
          "key": "instanceId",
          "control": "text",
          "description": "IBM Watson instance ID."
        },
        {
          "key": "model",
          "control": "text",
          "description": "Recognition model name."
        },
        {
          "key": "languageCustomizationId",
          "control": "text",
          "description": "ID of a custom language model."
        },
        {
          "key": "acousticCustomizationId",
          "control": "text",
          "description": "ID of a custom acoustic model."
        },
        {
          "key": "baseModelVersion",
          "control": "text",
          "description": "Base model version to use."
        },
        {
          "key": "watsonMetadata",
          "control": "text",
          "description": "Customer ID metadata for data labeling."
        },
        {
          "key": "watsonLearningOptOut",
          "control": "bool",
          "description": "Opt out of IBM data collection for service improvements."
        }
      ],
      "xai": [
        {
          "key": "apiKey",
          "control": "text",
          "description": "xAI API key. Overrides the key configured in jambonz."
        },
        {
          "key": "endpointing",
          "control": "number",
          "description": "Milliseconds of silence before an utterance is considered final. Range 0-5000."
        },
        {
          "key": "diarize",
          "control": "bool",
          "description": "Enable speaker diarization."
        },
        {
          "key": "fillerWords",
          "control": "bool",
          "description": "Include filler words (um, uh) in transcript."
        },
        {
          "key": "keyterms",
          "control": "list",
          "description": "Key terms to boost recognition for."
        },
        {
          "key": "smartTurn",
          "control": "number",
          "description": "End-of-turn confidence threshold, between 0.0 and 1.0."
        },
        {
          "key": "smartTurnTimeout",
          "control": "number",
          "description": "Maximum milliseconds of silence to wait before forcing an end-of-turn final result. Range 1-5000."
        }
      ],
      "modulate": [
        {
          "key": "apiKey",
          "control": "text",
          "description": "Modulate API key. Overrides the key configured in jambonz."
        },
        {
          "key": "endpointing",
          "control": "bool",
          "description": "Only applies to model 'velma-2-stt-streaming-english-v2': emit a final transcript for each pause-delimited speech segment. Defaults to true in jambonz; set false to receive a single final transcript when the stream ends."
        },
        {
          "key": "emotionSignal",
          "control": "bool",
          "description": "Only applies to model 'velma-2-stt-streaming': detect the speaker's emotional tone for each utterance."
        },
        {
          "key": "accentSignal",
          "control": "bool",
          "description": "Only applies to model 'velma-2-stt-streaming': identify the speaker's accent for each utterance."
        },
        {
          "key": "deepfakeSignal",
          "control": "bool",
          "description": "Only applies to model 'velma-2-stt-streaming': score each utterance for synthetic (deepfake) voice likelihood."
        },
        {
          "key": "piiPhiTagging",
          "control": "bool",
          "description": "Only applies to model 'velma-2-stt-streaming': wrap detected PII/PHI in tags within the transcript text."
        },
        {
          "key": "modulateSttUri",
          "control": "text",
          "description": "Custom host to connect to instead of platform.modulate.ai."
        },
        {
          "key": "modulateSttUseTls",
          "control": "bool",
          "description": "Use TLS when connecting to a custom host. Default true."
        }
      ],
      "assemblyai": [
        {
          "key": "apiKey",
          "control": "text",
          "description": "AssemblyAI API key. Overrides credentials configured in jambonz."
        },
        {
          "key": "serviceVersion",
          "control": "enum",
          "enum": [
            "v2",
            "v3"
          ],
          "description": "AssemblyAI streaming API version."
        },
        {
          "key": "speechModel",
          "control": "text",
          "description": "AssemblyAI speech model to use for recognition."
        },
        {
          "key": "formatTurns",
          "control": "bool",
          "description": "Enable turn-level formatting."
        },
        {
          "key": "endOfTurnConfidenceThreshold",
          "control": "number",
          "description": "Confidence threshold for end-of-turn detection."
        },
        {
          "key": "minEndOfTurnSilenceWhenConfident",
          "control": "number",
          "description": "Minimum silence duration (milliseconds) to trigger end-of-turn when confidence is met. Default: 400."
        },
        {
          "key": "maxTurnSilence",
          "control": "number",
          "description": "Maximum silence duration (milliseconds) before forcing end-of-turn. Default: 1280."
        },
        {
          "key": "minTurnSilence",
          "control": "number",
          "description": "Minimum silence duration (milliseconds) before allowing end-of-turn."
        },
        {
          "key": "keyterms",
          "control": "list",
          "description": "List of key terms to boost in recognition."
        },
        {
          "key": "prompt",
          "control": "text",
          "description": "Prompt to guide the recognition model."
        },
        {
          "key": "languageDetection",
          "control": "bool",
          "description": "Enable automatic language detection."
        },
        {
          "key": "vadThreshold",
          "control": "number",
          "description": "Voice activity detection threshold."
        },
        {
          "key": "inactivityTimeout",
          "control": "number",
          "description": "Timeout (seconds) for inactivity before closing the stream."
        }
      ],
      "elevenlabs": [
        {
          "key": "includeTimestamps",
          "control": "bool",
          "description": "Include word-level timestamps in results."
        },
        {
          "key": "commitStrategy",
          "control": "enum",
          "enum": [
            "manual",
            "vad"
          ],
          "description": "How audio chunks are committed. 'manual' for explicit commits, 'vad' for voice activity detection."
        },
        {
          "key": "vadSilenceThresholdSecs",
          "control": "number",
          "description": "Silence duration in seconds to trigger VAD commit."
        },
        {
          "key": "vadThreshold",
          "control": "number",
          "description": "VAD activation threshold."
        },
        {
          "key": "minSpeechDurationMs",
          "control": "number",
          "description": "Minimum speech duration in milliseconds to accept."
        },
        {
          "key": "minSilenceDurationMs",
          "control": "number",
          "description": "Minimum silence duration in milliseconds to trigger end of speech."
        },
        {
          "key": "enableLogging",
          "control": "bool",
          "description": "Enable server-side logging."
        }
      ]
    },
    "jsonVendors": [
      "custom",
      "gladia",
      "houndify",
      "nvidia",
      "openai",
      "soniox",
      "speechmatics"
    ]
  }
};
  root.JambonzSpeechSchema = schema;
  if (typeof module !== 'undefined' && module.exports) module.exports = schema;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
