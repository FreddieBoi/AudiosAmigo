/// <reference path="typings/tsd.d.ts" />

class AudioModel {

    private static fileExtension = ".wav";

    public recordedAt: Date;

    public blob: any;

    public url: string;

    constructor(blob: any) {
        this.recordedAt = new Date();
        this.blob = blob;
        this.url = URL.createObjectURL(blob);
    }

    public getFileName(): string {
        return `AudiosAmigo-${this.recordedAt.toISOString()}${AudioModel.fileExtension}`;
    }

}
