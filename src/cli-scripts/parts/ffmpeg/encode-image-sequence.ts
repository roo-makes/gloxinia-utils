import { Observable } from "rxjs";
import path from "path";
import { Size } from "../../types/common";
import { runFfmpegObservable } from "./run-ffmpeg-observable";

interface EncodeImageSequenceOptions {
  input: string;
  output: string;
  outputPrefix: string;
  size: Size;
}

function encodeImageSequence({
  input,
  output,
  outputPrefix,
  size,
}: EncodeImageSequenceOptions): Observable<string> {
  // Generate output path with frame number pattern
  // %04d means 4-digit zero-padded numbers (0001, 0002, etc.)
  const outputPath = path.resolve(output, `./${outputPrefix}-f%04d.png`);

  return runFfmpegObservable({
    inputPath: path.resolve(input),
    outputPath: outputPath,
    args: [
      "-an", // Remove audio (not needed for image sequences)
      "-filter:v",
      `scale=${size.width}:${size.height}`, // Scale to target dimensions
      // PNG format is automatically detected from .png extension
    ],
  });
}

export default encodeImageSequence;
