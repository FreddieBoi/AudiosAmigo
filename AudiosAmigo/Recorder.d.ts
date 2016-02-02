﻿// Type definitions for Recorder.js

interface RecorderConfig {

    /**
     * Path to recorder.js worker script.
     * Defaults to 'js/recorderjs/recorderWorker.js'
     */
    workerPath?: string;

    /**
     * The length of the buffer that the internal JavaScriptNode uses to capture the audio.
     * Can be tweaked if experiencing performance issues.Defaults to 4096.
     */
    bufferLen?: number;

    /**
     * A default callback to be used with exportWAV.
     */
    callback?: (blob: any) => void;

    /**
     * The type of the Blob generated by exportWAV.
     * Defaults to 'audio/wav'.
     */
    type?: any;

}

interface Recorder {

    record(): void;

    stop(): void;

    clear(): void;

    exportWAV(callback?: (blob: any) => void, type?: any): void;

    getBuffer(callback?: (buffers: any[]) => void): void;

    configure(config: RecorderConfig): void;

}

declare var Recorder: {

    forceDownload(blob: any, filename?: string): void;

    prototype: Recorder;

    /**
     * Recorder.
     *
     * @param source The node whose output you wish to capture
     * @param config (optional) A configuration object
     */
    new (source: AudioNode, config?: RecorderConfig): Recorder;

}