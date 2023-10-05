import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import { Size } from "../types/common";
import encodeVideoHap from "./encode-video-hap";
import getSourceVideoInfo from "./get-source-video-info";
import getVideoParamsMatrix from "./get-video-params-matrix";

interface EncodeVideosOptions {
  inputFiles: string[];
  fpses: number[];
  outputPath: string;
  sizes: Size[];
}

const adjustDurationForFps = (
  duration: number,
  origFps: number,
  newFps: number
) => {
  return Math.round(duration * (newFps / origFps));
};

const encodeVideosHap = async (options: EncodeVideosOptions) => {
  const { inputFiles, outputPath, fpses, sizes } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const inputParts = path.parse(inputPath);
      const inputFile = inputParts.base;
      const { fps, duration } = await getSourceVideoInfo(inputPath);

      const paramsMatrix = getVideoParamsMatrix({
        fpses,
        sizes,
      });

      console.log(paramsMatrix);

      const videoTasks = paramsMatrix.flatMap((params) => {
        const stats = [
          params.size.width + "w",
          params.size.height + "h",
          params.fps + "fps",
          adjustDurationForFps(duration, fps, params.fps) + "d",
        ];
        const outputFilename = `${inputParts.name}-${stats.join("-")}.mov`;
        const output = path.resolve(outputPath, outputFilename);

        if (existsSync(output)) return [];

        const listrTask: ListrTask = {
          title: `Encoding ${outputFilename}`,
          task: () =>
            encodeVideoHap({
              input: path.resolve(inputPath),
              output,
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

export default encodeVideosHap;
