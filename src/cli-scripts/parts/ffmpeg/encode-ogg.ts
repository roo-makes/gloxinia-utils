import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import fsExtra from "fs-extra";
import { attachFfmpegLogging } from "../../utils/attach-ffmpeg-logging";

interface EncodeOggOptions {
  input: string;
  output: string;
}

const encodeOgg = ({ input, output }: EncodeOggOptions) => {
  fsExtra.ensureDirSync(path.dirname(output));

  return new Observable<string>((subscriber) => {
    const ffmpegBuiltCommand = ffmpegCommand(path.resolve(input))
      .noVideo()
      .addOption("-y")
      .audioCodec("libvorbis");

    attachFfmpegLogging(ffmpegBuiltCommand, subscriber);

    ffmpegBuiltCommand.save(output);
  });
};

export default encodeOgg;
