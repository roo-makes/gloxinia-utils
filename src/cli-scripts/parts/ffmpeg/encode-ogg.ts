import path from "path";
import { runFfmpegObservable } from "./run-ffmpeg-observable";

interface EncodeOggOptions {
  input: string;
  output: string;
}

const encodeOgg = ({ input, output }: EncodeOggOptions) => {
  return runFfmpegObservable({
    inputPath: path.resolve(input),
    outputPath: output,
    args: ["-an", "-c:a", "libvorbis"],
  });
};

export default encodeOgg;
