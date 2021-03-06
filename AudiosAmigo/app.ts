﻿/// <reference path="typings/tsd.d.ts" />

$(document).ready(() => {
    var recordingsHtmlId = "#recordings";
    var startRecordingButtonHtmlId = "#record-start";
    var stopRecordingButtonHtmlId = "#record-stop";

    var audioManager = new AudioManager((recording) => {
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
        $(anchorElement).on("click", () => {
            Recorder.forceDownload(recording.blob, recording.getFileName())
        });
        listItemElement.appendChild(anchorElement);

        $(recordingsHtmlId).prepend($(listItemElement));
    });

    $(stopRecordingButtonHtmlId).attr("disabled", "disabled");
    $(startRecordingButtonHtmlId).on("click", () => {
        audioManager.startRecording();
        $(startRecordingButtonHtmlId).attr("disabled", "disabled");
        $(stopRecordingButtonHtmlId).removeAttr("disabled");
    });
    $(stopRecordingButtonHtmlId).on("click", () => {
        audioManager.stopRecording();
        $(stopRecordingButtonHtmlId).attr("disabled", "disabled");
        $(startRecordingButtonHtmlId).removeAttr("disabled");
    });

    var interimTranscriptHtmlId = "#paragraph-transcript-interim";
    var finalTranscriptHtmlId = "#paragraph-transcript-final";
    var startSpeechRecognitionButtonHtmlId = "#speech-recognition-start";
    var stopSpeechRecognitionButtonHtmlId = "#speech-recognition-stop";
    var speechRecognitionManager = new SpeechRecognitionManager("en-US",
        (result) => {
            $(interimTranscriptHtmlId).text(`${result.index}: ${result.transcript} (${result.confidence})`);
        },
        (result) => {
            $(finalTranscriptHtmlId).text($(finalTranscriptHtmlId).text() + result.transcript);
        }
    );

    $(stopSpeechRecognitionButtonHtmlId).attr("disabled", "disabled");
    $(startSpeechRecognitionButtonHtmlId).on("click", () => {
        speechRecognitionManager.startSpeechRecognition();
        $(startSpeechRecognitionButtonHtmlId).attr("disabled", "disabled");
        $(stopSpeechRecognitionButtonHtmlId).removeAttr("disabled");
    });
    $(stopSpeechRecognitionButtonHtmlId).on("click", () => {
        speechRecognitionManager.stopSpeechRecognition();
        $(stopSpeechRecognitionButtonHtmlId).attr("disabled", "disabled");
        $(startSpeechRecognitionButtonHtmlId).removeAttr("disabled");
    });
});
