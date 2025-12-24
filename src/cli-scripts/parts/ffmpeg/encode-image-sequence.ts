import { Observable } from "rxjs";
import path from "path";
import { Size } from "../../types/common";
import { runFfmpegObservable } from "./run-ffmpeg-observable";

interface EncodeImageSequenceOptions {
  input: string;
  outputDir: string;
  outputPrefix?: string;
  includeFrameNumbers?: boolean;
  frameIndex?: number;
  size: Size;
}

export const encodeImageSequence = ({
  input,
  outputDir,
  outputPrefix = "output",
  includeFrameNumbers = true,
  frameIndex,
  size,
}: EncodeImageSequenceOptions): Observable<string> => {
  const filenameParts = [];
  if (outputPrefix) {
    filenameParts.push(outputPrefix);
  }
  if (includeFrameNumbers) {
    filenameParts.push("%04d");
  }

  const outputPath = path.resolve(
    outputDir,
    `./${filenameParts.join("-")}.png`
  );

  const filterParts = [];

  // Determine if we're outputting a single frame
  const isSingleFrame = frameIndex !== undefined || !includeFrameNumbers;

  // If frameIndex is specified, select only that frame
  // If includeFrameNumbers is false, extract the first frame (frame 0)
  if (isSingleFrame) {
    const frameToExtract = frameIndex ?? 0;
    filterParts.push(`select=eq(n\\,${frameToExtract})`);
  }

  // Always scale to target dimensions
  filterParts.push(`scale=${size.width}:${size.height}`);

  const args = [
    "-an", // Remove audio (not needed for image sequences)
    "-filter:v",
    filterParts.join(","),
  ];

  // If outputting a single frame, limit to 1 frame and add -update flag
  if (isSingleFrame) {
    args.push("-vframes", "1", "-update", "1");
  }

  return runFfmpegObservable({
    inputPath: path.resolve(input),
    outputPath: outputPath,
    args: args,
  });
};
