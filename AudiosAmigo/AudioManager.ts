/// <reference path="typings/tsd.d.ts" />
/// <reference path="AudioModel.ts" />
/// <reference path="Recorder.d.ts" />

class AudioManager {

    private static mediaStreamConstraints: MediaStreamConstraints = { audio: true };

    private static recorderConfig: RecorderConfig = { workerPath: "bower_components/recorderjs/recorderWorker.js" };

    private audioContext: AudioContext;

    private recorder: Recorder;

    private onRecordingAddedCallback: (recording: AudioModel) => void;

    public recordings: AudioModel[] = [];

    constructor(onRecordingAddedCallback?: (recording: AudioModel) => void) {
        this.onRecordingAddedCallback = onRecordingAddedCallback;

        try {
            console.info("Initializing Web Audio API...");
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            this.audioContext = new AudioContext();
        } catch (error) {
            console.error(`Web Audio API is NOT supported: ${error}`);
        }

        navigator.getUserMedia(AudioManager.mediaStreamConstraints,
            (stream) => this.startUserMedia(stream),
            (error) => {
                console.error(`Failed to get user media: ${error}"`);
            }
        );
    }

    private startUserMedia(stream: MediaStream): void {
        console.debug("Initializing media stream...");
        var mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

        console.debug("Initializing recorder...");
        this.recorder = new Recorder(mediaStreamSource, AudioManager.recorderConfig);
    }

    private createRecording(): void {
        if (!this.recorder) {
            return;
        }
        this.recorder.exportWAV((blob: any) => {
            console.debug("Recording exported.");
            var recording = new AudioModel(blob);
            this.recordings.push(recording);
            if (this.onRecordingAddedCallback) {
                this.onRecordingAddedCallback(recording);
            }
        });
    }

    public startRecording(): void {
        if (!this.recorder) {
            return;
        }
        console.debug("Recording...");
        this.recorder.record();
    }

    public stopRecording(): void {
        if (!this.recorder) {
            return;
        }
        console.debug("Recording stopped!");
        this.recorder.stop();

        this.createRecording();

        this.recorder.clear();
    }

}
