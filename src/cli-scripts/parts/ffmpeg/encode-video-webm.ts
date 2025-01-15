import { Observable } from "rxjs";
import ffmpegCommand from "fluent-ffmpeg";
import path from "path";
import fsExtra from "fs-extra";
import { EncodeVideoOptions } from "../../types/common";
import { attachFfmpegLogging } from "../../utils/attach-ffmpeg-logging";

type EncodeVideoOptionsWebm = EncodeVideoOptions & {
  crf: number;
  bitrate: number;
};

function encodeVideoWebm({
  input,
  output,
  fps,
  crf,
  bitrate,
  height,
  width,
}: EncodeVideoOptionsWebm): Observable<string> {
  fsExtra.ensureDirSync(path.dirname(output));

  return new Observable<string>((subscriber) => {
    const ffmpegBuiltCommand = ffmpegCommand(path.resolve(input))
      .noAudio()
      .videoCodec("libvpx")
      .outputFPS(fps)
      .size(`${width}x${height}`)
      .videoBitrate(bitrate)
      .outputOption(`-pix_fmt yuva420p`)
      .outputOption(`-crf ${crf}`)
      .outputOption("-auto-alt-ref 0")
      .outputOption("-threads 4")
      .outputOption("-quality good")
      .outputOption("-cpu-used 0");

    attachFfmpegLogging(ffmpegBuiltCommand, subscriber);

    ffmpegBuiltCommand.save(output);
  });
}

export default encodeVideoWebm;
