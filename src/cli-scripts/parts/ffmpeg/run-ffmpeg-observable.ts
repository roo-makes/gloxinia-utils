import { Observable } from "rxjs";
import childProcess from "child_process";
import { parseFfmpegLogs } from "../../utils/parse-ffmpeg-logs";
import path from "path";
import fsExtra from "fs-extra";

export const FFMPEG_COMMAND = "ffmpeg";

type RunFfmpegObservableArgs = {
  ffmpegPath?: string;
  args: string[];
  inputPath: string;
  outputPath: string;
};

/**
 * This function should run a ffmpeg command using child_process.spawn
 * and return an Observable that emits the output of the command.
 * @param command
 * @returns Observable<string>
 */
export const runFfmpegObservable = ({
  ffmpegPath = FFMPEG_COMMAND,
  args,
  inputPath,
  outputPath,
}: RunFfmpegObservableArgs): Observable<string> => {
  const resolvedOutputPath = path.resolve(outputPath);
  fsExtra.ensureDirSync(path.dirname(resolvedOutputPath));

  return new Observable<string>((subscriber) => {
    const spawnArgs = ["-i", inputPath, ...args, resolvedOutputPath];
    const ffmpegProcess = childProcess.spawn(ffmpegPath, spawnArgs);

    subscriber.next("Starting encoding...");

    ffmpegProcess.stdout.on("data", (data) =>
      parseFfmpegLogs(data.toString(), false, subscriber)
    );

    // FFmpeg writes informational output to stderr, not stdout
    ffmpegProcess.stderr.on("data", (data) =>
      parseFfmpegLogs(data.toString(), true, subscriber)
    );

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        subscriber.error(new Error(`FFmpeg process exited with code ${code}`));
      } else {
        subscriber.next("Encoding completed successfully");
        subscriber.complete();
      }
    });

    ffmpegProcess.on("error", (err) => {
      subscriber.error(new Error(`Failed to start FFmpeg: ${err.message}`));
    });
  });
};
