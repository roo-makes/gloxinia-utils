import { Subscriber } from "rxjs";
import { FfmpegCommand } from "fluent-ffmpeg";

export function attachFfmpegLogging(
  ffmpegCommand: FfmpegCommand,
  subscriber: Subscriber<string>
) {
  ffmpegCommand.on("start", (startCommand: string) => {
    subscriber.next(startCommand);
    subscriber.next("Started encode...");
  });

  ffmpegCommand.on("progress", ({ percent, targetSize }) => {
    subscriber.next(`Progress: ${percent}%, targetSize: ${targetSize}`);
  });

  ffmpegCommand.on("error", (err, stdout, stderr) => {
    subscriber.error(err);
  });

  ffmpegCommand.on("end", (stdout, stderr) => {
    subscriber.next(stdout);
    subscriber.complete();
  });
}
