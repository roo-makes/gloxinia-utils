import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";

interface EncodeVideoOptions {
  input: string;
  output: string;
  crf: number;
  fps: number;
  bitrate: number;
  height: Number;
  width: Number;
}

const encodeVideo = ({
  input,
  output,
  fps,
  crf,
  bitrate,
  height,
  width,
}: EncodeVideoOptions) => {
  return new Observable<string>((subscriber) => {
    ffmpegCommand(path.resolve(input))
      .noAudio()
      .videoCodec("libvpx")
      .outputFPS(fps)
      .videoBitrate(bitrate)
      .size(`${width}x${height}`)
      .outputOption(`-pix_fmt yuva420p`)
      .outputOption(`-crf ${crf}`)
      .outputOption("-auto-alt-ref 0")
      .outputOption("-threads 4")
      .outputOption("-quality good")
      .outputOption("-cpu-used 0")
      .on("start", (startCommand: string) => {
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
};

export default encodeVideo;
