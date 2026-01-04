import { Listr, ListrTask } from "listr2";
import path from "path";
import { Observable } from "rxjs";
import { Size, OutputVideoFormat, EncodeVideoOptions } from "../types/common";
import { fileExistsAndIsNewerSync } from "../utils/file-exists-and-is-newer";
import { getOutputPath } from "../utils/get-output-path";
import encodeVideoHap from "./ffmpeg/encode-video-hap";
import encodeVideoWebm from "./ffmpeg/encode-video-webm";
import { encodeVideoWebmNoAlpha } from "./ffmpeg/encode-video-webm-noalpha";
import { getSizesForInputFile } from "./get-sizes-for-input-file";
import getSourceVideoInfo from "./get-source-video-info";
import getVideoParamsMatrix from "./get-video-params-matrix";

type EncodeVideosOptions = {
  /** Input filepaths to encode. They are expected to be relative to inputBasePath. */
  inputFiles: string[];
  /** The root path for the input files. Output relative paths will be derived from the difference between input and inputBasePath. */
  inputBasePath: string;
  /** The root path for the output files. Output filepaths will be relative to this path. */
  outputBasePath: string;
  /** The format to encode the videos to. */
  outputFormat: OutputVideoFormat;
  /** The frames per second to encode the videos to. */
  fpses: number[];
  /** The CRF value to encode the videos to. */
  crfs?: number[];
  /** The sizes to encode the videos to. */
  sizes?: Size[];
};

const encoderForFormat: Record<
  OutputVideoFormat,
  (options: EncodeVideoOptions) => Observable<string>
> = {
  webm: encodeVideoWebm,
  webmNoAlpha: encodeVideoWebmNoAlpha,
  hap: encodeVideoHap,
};

const outputExtensionForFormat: Record<OutputVideoFormat, string> = {
  webm: "webm",
  webmNoAlpha: "webm",
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
  console.log(options);
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
      const videoInfo = await getSourceVideoInfo(inputPath);
      const { fps, duration } = videoInfo;

      const sizesForInputFile = await getSizesForInputFile(
        inputPath,
        videoInfo
      );
      if (sizesForInputFile.length === 0) {
        console.error(
          `No sizes found for ${inputPath}, ensure the input path matches a substring in the sizes.ts file`
        );
        return {
          title: `Skipping ${inputPath} -- no sizes found.`,
          task: () => Promise.resolve(),
        };
      }

      const paramsMatrix = getVideoParamsMatrix(
        {
          crfs,
          fpses,
          sizes: sizes || sizesForInputFile,
        },
        outputFormat
      );

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

      const inputFilename = path.basename(inputPath);

      return {
        title: `Encoding videos for ${inputFilename}`,
        task: (ctx: any, task: any): Listr => task.newListr(videoTasks),
      };
    })
  );

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};
