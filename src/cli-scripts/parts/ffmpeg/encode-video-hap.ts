import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import fsExtra from "fs-extra";
import { attachFfmpegLogging } from "../../utils/attach-ffmpeg-logging";
import { EncodeVideoOptions } from "../../types/common";

function encodeVideoHap({
  input,
  output,
  fps,
  height,
  width,
}: EncodeVideoOptions): Observable<string> {
  fsExtra.ensureDirSync(path.dirname(output));

  return new Observable<string>((subscriber) => {
    const ffmpegBuiltCommand = ffmpegCommand(path.resolve(input))
      .noAudio()
      .videoCodec("hap")
      .outputFPS(fps)
      .size(`${width}x${height}`)
      .outputOption("-format hap_alpha");

    attachFfmpegLogging(ffmpegBuiltCommand, subscriber);

    ffmpegBuiltCommand.save(output);
  });
}

export default encodeVideoHap;
