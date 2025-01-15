import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import { Size } from "../../types/common";
import { attachFfmpegLogging } from "../../utils/attach-ffmpeg-logging";

interface EncodeImageSequenceOptions {
  input: string;
  output: string;
  outputPrefix: string;
  size: Size;
}

const encodeImageSequence = ({
  input,
  output,
  outputPrefix,
  size,
}: EncodeImageSequenceOptions) => {
  return new Observable<string>((subscriber) => {
    const ffmpegBuiltCommand = ffmpegCommand(path.resolve(input)).size(
      `${size.width}x${size.height}`
    );

    attachFfmpegLogging(ffmpegBuiltCommand, subscriber);

    ffmpegBuiltCommand.save(
      path.resolve(output, `./${outputPrefix}-f%04d.png`)
    );
  });
};

export default encodeImageSequence;
