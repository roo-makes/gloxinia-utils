import { Observable } from "rxjs";
import path from "path";
import { EncodeVideoOptions } from "../../types/common";
import { runFfmpegObservable } from "./run-ffmpeg-observable";

function encodeVideoWebm({
  input,
  output,
  fps,
  qualitySettings,
  height,
  width,
}: EncodeVideoOptions): Observable<string> {
  const args = [
    "-an", // Remove audio (correct FFmpeg option)
    "-r",
    `${fps}`, // Output frame rate
    "-filter:v",
    `scale=${width}:${height}`, // Scale video to target dimensions
    "-c:v",
    "libvpx", // Use libvpx codec (VP8/VP9) for WebM
    "-pix_fmt",
    "yuva420p", // Pixel format with alpha channel (YUVA = YUV + Alpha)
    "-auto-alt-ref",
    "0", // Disable alternate reference frames (can help with alpha)
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
    args.push("-crf", `${qualitySettings.crf}`); // Constant Rate Factor (quality)
  }

  return runFfmpegObservable({
    inputPath: path.resolve(input),
    outputPath: output,
    args,
  });
}

export default encodeVideoWebm;
