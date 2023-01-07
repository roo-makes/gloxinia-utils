import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import encodeVideo from "./encode-video";
import getSizesForRatio from "./get-sizes-for-ratio";
import getSourceVideoInfo from "./get-source-video-info";
import getVideoParamsMatrix from "./get-video-params-matrix";

interface EncodeVideosOptions {
  inputFiles: string[];
  crfs: number[];
  bitrates: number[];
  fpses: number[];
  outputPath: string;
}

const encodeVideos = async (options: EncodeVideosOptions) => {
  const { inputFiles, outputPath, crfs, fpses, bitrates } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const inputParts = path.parse(inputPath);
      const inputFile = inputParts.base;
      const { size, fps, duration } = await getSourceVideoInfo(inputPath);

      const sizes = getSizesForRatio(size.width / size.height);

      const paramsMatrix = getVideoParamsMatrix({
        crfs,
        bitrates,
        fpses,
        sizes,
      });

      const videoTasks = paramsMatrix.flatMap((params) => {
        const stats = [
          params.size.width + "w",
          params.size.height + "h",
          params.fps + "fps",
          duration + "d",
          params.crf + "crf",
        ];
        const outputFilename = `${inputParts.name}-${stats.join("-")}.webm`;
        const output = path.resolve(outputPath, outputFilename);

        if (existsSync(output)) return [];

        const listrTask: ListrTask = {
          title: `Encoding ${outputFilename}`,
          task: () =>
            encodeVideo({
              input: path.resolve(inputPath),
              output,
              crf: params.crf,
              bitrate: params.bitrate,
              height: params.size.height,
              width: params.size.width,
              fps: params.fps,
            }),
        };

        return [listrTask];
      });

      return {
        title: `Processing ${inputFile}`,
        task: (ctx: any, task: any): Listr => task.newListr(videoTasks),
      };
    })
  );

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};

export default encodeVideos;
