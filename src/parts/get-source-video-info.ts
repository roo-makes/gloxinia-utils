import { ffprobe, FfprobeData } from "fluent-ffmpeg";
import { Size } from "../types/common";

interface VideoInfo {
  size: Size;
  fps: number;
  duration: number;
}

const getSourceVideoInfo = (inputPath: string): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const stream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (!stream) {
        reject(new Error("Video stream not found"));
        return;
      }

      const fpsParts = stream.r_frame_rate?.split("/") || [];
      if (fpsParts.length !== 2) {
        reject(new Error(`Invalid fps from ffprobe: ${stream.r_frame_rate}`));
        return;
      }
      const fps: number = Math.round(
        parseFloat(fpsParts[0]) / parseFloat(fpsParts[1])
      );

      if (!stream.width) {
        reject(new Error(`Invalid width from ffprobe: ${stream.width}`));
        return;
      }

      if (!stream.height) {
        reject(new Error(`Invalid height from ffprobe: ${stream.height}`));
        return;
      }

      if (!stream.nb_frames) {
        reject(
          new Error(`Invalid nb_frames from ffprobe: ${stream.nb_frames}`)
        );
        return;
      }

      const duration = parseInt(stream.nb_frames);

      resolve({
        size: {
          width: stream.width,
          height: stream.height,
        },
        fps,
        duration,
      });
    });
  });
};

export default getSourceVideoInfo;
