import { Observable } from "rxjs";
import path from "path";
import { EncodeVideoOptions } from "../../types/common";
import { runFfmpegObservable } from "./run-ffmpeg-observable";

export function encodeVideoWebmNoAlpha({
  input,
  output,
  fps,
  qualitySettings,
  height,
  width,
}: EncodeVideoOptions): Observable<string> {
  console.log({ input, output, fps, height, width, qualitySettings });
  const args = [
    "-an", // Remove audio
    "-r",
    `${fps}`, // Output frame rate
    "-filter:v",
    `scale=${width}:${height}`, // Scale video to target dimensions
    "-c:v",
    "libvpx", // Use libvpx codec (VP8/VP9) for WebM
    "-pix_fmt",
    "yuv420p", // Pixel format without alpha channel (YUV = YUV only, no Alpha)
    "-threads",
    "4", // Use 4 encoding threads
    "-quality",
    "good", // Quality preset: good balance of speed/quality
    "-cpu-used",
    "0", // Encoding speed (0 = slowest but best quality)
  ];

  // Add quality settings if provided
  if (qualitySettings) {
    args.push("-b:v", `${qualitySettings.bitrate}k`); // Video bitrate
    // args.push("-b:v", "0", "-maxrate", "10000k", "-bufsize", "20000k");
    args.push("-crf", `${qualitySettings.crf}`); // Constant Rate Factor (quality)
  }

  return runFfmpegObservable({
    inputPath: path.resolve(input),
    outputPath: output,
    args,
  });
}
