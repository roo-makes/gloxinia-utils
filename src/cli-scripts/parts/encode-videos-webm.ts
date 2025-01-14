import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import { Size } from "../types/common";
import {
  fileExistsAndIsNewer,
  fileExistsAndIsNewerSync,
} from "../utils/file-exists-and-is-newer";
import { getOutputPath } from "../utils/get-output-path";
import encodeVideoWebm from "./ffmpeg/encode-video-webm";
import getSourceVideoInfo from "./get-source-video-info";
import getVideoParamsMatrix from "./get-video-params-matrix";

interface EncodeVideosOptions {
  inputFiles: string[];
  inputBasePath: string;
  crfs: number[];
  fpses: number[];
  outputBasePath: string;
  sizes: Size[];
}

const adjustDurationForFps = (
  duration: number,
  origFps: number,
  newFps: number
) => {
  return Math.round(duration * (newFps / origFps));
};

const encodeVideosWebm = async (options: EncodeVideosOptions) => {
  const { inputFiles, outputBasePath, inputBasePath, crfs, fpses, sizes } =
    options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const { fps, duration } = await getSourceVideoInfo(inputPath);

      const paramsMatrix = getVideoParamsMatrix({
        crfs,
        fpses,
        sizes,
      });

      const videoTasks = paramsMatrix.flatMap((params) => {
        const stats = [
          params.size.width + "w",
          params.size.height + "h",
          params.fps + "fps",
          adjustDurationForFps(duration, fps, params.fps) + "d",
          params.crf + "crf",
        ];

        const { outputFilename, outputPath } = getOutputPath({
          inputPath,
          inputBasePath,
          outputBasePath,
          outputFilenameExtras: stats,
          outputExtension: "webm",
        });

        if (
          fileExistsAndIsNewerSync({
            inputPath,
            outputPath,
          })
        ) {
          console.log(`Skipping ${outputFilename} -- exists and is newer.`);
          return [];
        }

        const listrTask: ListrTask = {
          title: `Encoding ${outputFilename}`,
          task: () =>
            encodeVideoWebm({
              input: path.resolve(inputPath),
              output: outputPath,
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
        title: `Processing ${inputPath}`,
        task: (ctx: any, task: any): Listr => task.newListr(videoTasks),
      };
    })
  );

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};

export default encodeVideosWebm;
