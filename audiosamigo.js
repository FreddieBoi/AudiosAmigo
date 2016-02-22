/// <reference path="typings/tsd.d.ts" />
$(document).ready(function () {
    var recordingsHtmlId = "#recordings";
    var startRecordingButtonHtmlId = "#record-start";
    var stopRecordingButtonHtmlId = "#record-stop";
    var audioManager = new AudioManager(function (recording) {
        var listItemElement = document.createElement("li");
        var spanElement = document.createElement("span");
        spanElement.innerHTML = recording.getFileName();
        listItemElement.appendChild(spanElement);
        var audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.src = recording.url;
        listItemElement.appendChild(audioElement);
        var anchorElement = document.createElement("button");
        anchorElement.className = "btn btn-default";
        var iconElement = document.createElement("i");
        iconElement.className = "glyphicon glyphicon-download";
        anchorElement.appendChild(iconElement);
        $(anchorElement).append("&nbsp;Download");
        $(anchorElement).on("click", function () {
            Recorder.forceDownload(recording.blob, recording.getFileName());
        });
        listItemElement.appendChild(anchorElement);
        $(recordingsHtmlId).prepend($(listItemElement));
    });
    $(stopRecordingButtonHtmlId).attr("disabled", "disabled");
    $(startRecordingButtonHtmlId).on("click", function () {
        audioManager.startRecording();
        $(startRecordingButtonHtmlId).attr("disabled", "disabled");
        $(stopRecordingButtonHtmlId).removeAttr("disabled");
    });
    $(stopRecordingButtonHtmlId).on("click", function () {
        audioManager.stopRecording();
        $(stopRecordingButtonHtmlId).attr("disabled", "disabled");
        $(startRecordingButtonHtmlId).removeAttr("disabled");
    });
    var interimTranscriptHtmlId = "#paragraph-transcript-interim";
    var finalTranscriptHtmlId = "#paragraph-transcript-final";
    var startSpeechRecognitionButtonHtmlId = "#speech-recognition-start";
    var stopSpeechRecognitionButtonHtmlId = "#speech-recognition-stop";
    var speechRecognitionManager = new SpeechRecognitionManager("en-US", function (result) {
        $(interimTranscriptHtmlId).text(result.index + ": " + result.transcript + " (" + result.confidence + ")");
    }, function (result) {
        $(finalTranscriptHtmlId).text($(finalTranscriptHtmlId).text() + result.transcript);
    });
    $(stopSpeechRecognitionButtonHtmlId).attr("disabled", "disabled");
    $(startSpeechRecognitionButtonHtmlId).on("click", function () {
        speechRecognitionManager.startSpeechRecognition();
        $(startSpeechRecognitionButtonHtmlId).attr("disabled", "disabled");
        $(stopSpeechRecognitionButtonHtmlId).removeAttr("disabled");
    });
    $(stopSpeechRecognitionButtonHtmlId).on("click", function () {
        speechRecognitionManager.stopSpeechRecognition();
        $(stopSpeechRecognitionButtonHtmlId).attr("disabled", "disabled");
        $(startSpeechRecognitionButtonHtmlId).removeAttr("disabled");
    });
});
/// <reference path="typings/tsd.d.ts" />
var AudioModel = (function () {
    function AudioModel(blob) {
        this.recordedAt = new Date();
        this.blob = blob;
        this.url = URL.createObjectURL(blob);
    }
    AudioModel.prototype.getFileName = function () {
        return "AudiosAmigo-" + this.recordedAt.toISOString() + AudioModel.fileExtension;
    };
    AudioModel.fileExtension = ".wav";
    return AudioModel;
})();
/// <reference path="typings/tsd.d.ts" />
/// <reference path="AudioModel.ts" />
/// <reference path="Recorder.d.ts" />
var AudioManager = (function () {
    function AudioManager(onRecordingAddedCallback) {
        var _this = this;
        this.recordings = [];
        this.onRecordingAddedCallback = onRecordingAddedCallback;
        try {
            console.info("Initializing Web Audio API...");
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            this.audioContext = new AudioContext();
        }
        catch (error) {
            console.error("Web Audio API is NOT supported: " + error);
        }
        navigator.getUserMedia(AudioManager.mediaStreamConstraints, function (stream) { return _this.startUserMedia(stream); }, function (error) {
            console.error("Failed to get user media: " + error + "\"");
        });
    }
    AudioManager.prototype.startUserMedia = function (stream) {
        console.debug("Initializing media stream...");
        var mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        console.debug("Initializing recorder...");
        this.recorder = new Recorder(mediaStreamSource, AudioManager.recorderConfig);
    };
    AudioManager.prototype.createRecording = function () {
        var _this = this;
        if (!this.recorder) {
            return;
        }
        this.recorder.exportWAV(function (blob) {
            console.debug("Recording exported.");
            var recording = new AudioModel(blob);
            _this.recordings.push(recording);
            if (_this.onRecordingAddedCallback) {
                _this.onRecordingAddedCallback(recording);
            }
        });
    };
    AudioManager.prototype.startRecording = function () {
        if (!this.recorder) {
            return;
        }
        console.debug("Recording...");
        this.recorder.record();
    };
    AudioManager.prototype.stopRecording = function () {
        if (!this.recorder) {
            return;
        }
        console.debug("Recording stopped!");
        this.recorder.stop();
        this.createRecording();
        this.recorder.clear();
    };
    AudioManager.mediaStreamConstraints = { audio: true };
    AudioManager.recorderConfig = { workerPath: "bower_components/recorderjs/recorderWorker.js" };
    return AudioManager;
})();
/// <reference path="typings/tsd.d.ts" />
var SpeechRecognitionResultModel = (function () {
    function SpeechRecognitionResultModel(index, transcript, confidence) {
        this.index = index;
        this.transcript = transcript;
        this.confidence = confidence;
    }
    return SpeechRecognitionResultModel;
})();
/// <reference path="typings/tsd.d.ts" />
/// <reference path="SpeechRecognitionResultModel.ts" />
var SpeechRecognitionManager = (function () {
    function SpeechRecognitionManager(lang, onSpeechRecognitionInterimResultCallback, onSpeechRecognitionFinalResultCallback) {
        var _this = this;
        if (lang === void 0) { lang = "en-US"; }
        this.lang = lang;
        this.onSpeechRecognitionInterimResultCallback = onSpeechRecognitionInterimResultCallback;
        this.onSpeechRecognitionFinalResultCallback = onSpeechRecognitionFinalResultCallback;
        try {
            console.info("Initializing Web Speech Recognition API...");
            this.speechRecognition = new webkitSpeechRecognition();
            // Continue recognition even if the user pauses while speaking
            this.speechRecognition.continuous = true;
            // Get early, interim results (that may change)
            this.speechRecognition.interimResults = true;
            console.debug("Using language: " + lang);
            this.speechRecognition.lang = this.lang;
            this.speechRecognition.onstart = function (event) { return _this.onStart(event); };
            this.speechRecognition.onresult = function (event) { return _this.onResult(event); };
            this.speechRecognition.onerror = function (event) { return _this.onError(event); };
            this.speechRecognition.onend = function (event) { return _this.onEnd(event); };
        }
        catch (error) {
            console.error("Web Speech Recognition API is NOT supported: " + error);
        }
    }
    SpeechRecognitionManager.prototype.startSpeechRecognition = function () {
        if (!this.speechRecognition) {
            return;
        }
        console.debug("Start recognition...");
        this.speechRecognition.start();
    };
    SpeechRecognitionManager.prototype.stopSpeechRecognition = function () {
        if (!this.speechRecognition) {
            return;
        }
        console.debug("Stop recognition...");
        this.speechRecognition.stop();
    };
    SpeechRecognitionManager.prototype.onStart = function (event) {
        console.debug("Recognition started!");
    };
    SpeechRecognitionManager.prototype.onError = function (event) {
        if (!event) {
            return;
        }
        console.error(event.error + ": " + event.message);
    };
    SpeechRecognitionManager.prototype.onResult = function (event) {
        if (!event) {
            return;
        }
        console.debug("Recognition result: " + event.resultIndex + " (+" + (event.results ? event.results.length - event.resultIndex : 0) + ")");
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var r = event.results[i];
            var result = new SpeechRecognitionResultModel(i, r[0].transcript, r[0].confidence);
            if (this.onSpeechRecognitionFinalResultCallback && r.isFinal) {
                this.onSpeechRecognitionFinalResultCallback(result);
            }
            else if (this.onSpeechRecognitionInterimResultCallback) {
                this.onSpeechRecognitionInterimResultCallback(result);
            }
        }
    };
    SpeechRecognitionManager.prototype.onEnd = function (event) {
        console.debug("Recognition stopped!");
    };
    return SpeechRecognitionManager;
})();
