import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import fsExtra from "fs-extra";

interface EncodeOggOptions {
  input: string;
  output: string;
}

const encodeOgg = ({ input, output }: EncodeOggOptions) => {
  fsExtra.ensureDirSync(path.dirname(output));

  return new Observable<string>((subscriber) => {
    ffmpegCommand(path.resolve(input))
      .noVideo()
      .addOption("-y")
      .audioCodec("libvorbis")
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

export default encodeOgg;
