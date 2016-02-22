/// <reference path="typings/tsd.d.ts" />
/// <reference path="SpeechRecognitionResultModel.ts" />

class SpeechRecognitionManager {

    private speechRecognition: SpeechRecognition;

    private lang: string;

    private onSpeechRecognitionInterimResultCallback: (result: SpeechRecognitionResultModel) => void;

    private onSpeechRecognitionFinalResultCallback: (result: SpeechRecognitionResultModel) => void;

    constructor(lang: string = "en-US", onSpeechRecognitionInterimResultCallback?: (result: SpeechRecognitionResultModel) => void, onSpeechRecognitionFinalResultCallback?: (result: SpeechRecognitionResultModel) => void) {
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

            console.debug(`Using language: ${lang}`);
            this.speechRecognition.lang = this.lang;

            this.speechRecognition.onstart = (event) => this.onStart(event);
            this.speechRecognition.onresult = (event) => this.onResult(event);
            this.speechRecognition.onerror = (event) => this.onError(event);
            this.speechRecognition.onend = (event) => this.onEnd(event);
        } catch (error) {
            console.error(`Web Speech Recognition API is NOT supported: ${error}`);
        }
    }

    public startSpeechRecognition(): void {
        if (!this.speechRecognition) {
            return;
        }
        console.debug("Start recognition...");
        this.speechRecognition.start();
    }

    public stopSpeechRecognition(): void {
        if (!this.speechRecognition) {
            return;
        }
        console.debug("Stop recognition...");
        this.speechRecognition.stop();
    }

    private onStart(event: Event): void {
        console.debug("Recognition started!");
    }

    private onError(event: SpeechRecognitionError): void {
        if (!event) {
            return;
        }
        console.error(`${event.error}: ${event.message}`);
    }

    private onResult(event: SpeechRecognitionEvent): void {
        if (!event) {
            return;
        }
        console.debug(`Recognition result: ${event.resultIndex} (+${event.results ? event.results.length - event.resultIndex  : 0})`);
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var r = event.results[i];
            var result = new SpeechRecognitionResultModel(i, r[0].transcript, r[0].confidence);
            if (this.onSpeechRecognitionFinalResultCallback && r.isFinal) {
                this.onSpeechRecognitionFinalResultCallback(result);
            } else if (this.onSpeechRecognitionInterimResultCallback) {
                this.onSpeechRecognitionInterimResultCallback(result);
            }
        }
    }

    private onEnd(event: Event): void {
        console.debug("Recognition stopped!");
    }

}
