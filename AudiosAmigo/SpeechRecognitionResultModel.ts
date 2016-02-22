/// <reference path="typings/tsd.d.ts" />

class SpeechRecognitionResultModel {

    public index: number;

    public transcript: string;

    public confidence: number;

    constructor(index: number, transcript: string, confidence: number) {
        this.index = index;
        this.transcript = transcript;
        this.confidence = confidence;
    }

}
