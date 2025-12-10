import { Listr, ListrTask } from "listr2";
import path from "path";
import { Observable } from "rxjs";
import { Size, OutputVideoFormat, EncodeVideoOptions } from "../types/common";
import { fileExistsAndIsNewerSync } from "../utils/file-exists-and-is-newer";
import { getOutputPath } from "../utils/get-output-path";
import encodeVideoHap from "./ffmpeg/encode-video-hap";
import encodeVideoWebm from "./ffmpeg/encode-video-webm";
import getSizesForRatio from "./get-sizes-for-ratio";
import getSourceVideoInfo from "./get-source-video-info";
import getVideoParamsMatrix from "./get-video-params-matrix";

type EncodeVideosOptions = {
  inputFiles: string[];
  inputBasePath: string;
  outputBasePath: string;
  outputFormat: OutputVideoFormat;
  fpses: number[];
  crfs?: number[];
  sizes?: Size[];
};

const encoderForFormat: Record<
  OutputVideoFormat,
  (options: EncodeVideoOptions) => Observable<string>
> = {
  webm: encodeVideoWebm,
  hap: encodeVideoHap,
};

const outputExtensionForFormat: Record<OutputVideoFormat, string> = {
  webm: "webm",
  hap: "mov",
};

const adjustDurationForFps = (
  duration: number,
  origFps: number,
  newFps: number
) => {
  return Math.round(duration * (newFps / origFps));
};

export const encodeVideos = async (options: EncodeVideosOptions) => {
  const {
    inputFiles,
    outputBasePath,
    inputBasePath,
    outputFormat,
    crfs,
    fpses,
    sizes,
  } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const { fps, duration, size } = await getSourceVideoInfo(inputPath);

      const ratio = size.width / size.height;
      const sizesForRatio = getSizesForRatio(ratio);

      const paramsMatrix = getVideoParamsMatrix({
        crfs,
        fpses,
        sizes: sizes || sizesForRatio,
      });

      const encoder = encoderForFormat[outputFormat];

      const videoTasks = paramsMatrix.flatMap((params) => {
        const stats = [
          params.size.width + "w",
          params.size.height + "h",
          params.fps + "fps",
          adjustDurationForFps(duration, fps, params.fps) + "d",
          crfs ? params.crf + "crf" : "",
        ];

        const { outputFilename, outputPath } = getOutputPath({
          inputPath,
          inputBasePath,
          outputBasePath,
          outputFilenameExtras: stats,
          outputExtension: outputExtensionForFormat[outputFormat],
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
            encoder({
              input: path.resolve(inputPath),
              output: outputPath,
              height: params.size.height,
              width: params.size.width,
              fps: params.fps,
              qualitySettings: {
                crf: params.crf,
                bitrate: params.bitrate,
              },
            }),
        };

        return [listrTask];
      });

      return {
        title: `Encoding videos for ${inputPath}`,
        task: (ctx: any, task: any): Listr => task.newListr(videoTasks),
      };
    })
  );

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};
