import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import { start } from "repl";

interface EncodeVideoOptionsHap {
  input: string;
  output: string;
  fps: number;
  height: Number;
  width: Number;
}

function encodeVideoHap({
  input,
  output,
  fps,
  height,
  width,
}: EncodeVideoOptionsHap): Observable<string> {
  return new Observable<string>((subscriber) => {
    ffmpegCommand(path.resolve(input))
      .noAudio()
      .videoCodec("hap")
      .outputFPS(fps)
      .size(`${width}x${height}`)
      .addOption("-format hap_alpha")
      .on("start", (startCommand: string) => {
        console.log(startCommand);
        subscriber.next(startCommand);
        subscriber.next("Started encode...");
      })
      .on("progress", ({ percent, targetSize }) => {
        subscriber.next(`Progress: ${percent}%`);
      })
      .on("error", (err, stdout, stderr) => {
        subscriber.error(err);
      })
      .on("end", (stdout, stderr) => {
        subscriber.next(stdout);
        subscriber.complete();
      })
      .save(output);
  });
}

export default encodeVideoHap;
