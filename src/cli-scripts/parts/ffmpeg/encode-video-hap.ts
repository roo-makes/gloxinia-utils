import { Observable } from "rxjs";
import path from "path";
import { EncodeVideoOptions } from "../../types/common";
import { runFfmpegObservable } from "./run-ffmpeg-observable";

function encodeVideoHap({
  input,
  output,
  fps,
  height,
  width,
}: EncodeVideoOptions): Observable<string> {
  return runFfmpegObservable({
    inputPath: path.resolve(input),
    outputPath: output,
    args: [
      "-an", // no audio

      "-filter:v",
      `scale=${width}:${height}`,

      "-c:v",
      "hap",

      "-format",
      "hap_alpha",

      "-r",
      `${fps}`,
    ],
  });
}

export default encodeVideoHap;
