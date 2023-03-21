import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import { Size } from "../types/common";

interface EncodeImageSequenceOptions {
  input: string;
  output: string;
  size: Size;
}

const encodeImageSequence = ({
  input,
  output,
  size,
}: EncodeImageSequenceOptions) => {
  return new Observable<string>((subscriber) => {
    ffmpegCommand(path.resolve(input))
      .size(`${size.width}x${size.height}`)
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
      .save(path.resolve(output, "./output-%04d.png"));
  });
};

export default encodeImageSequence;
