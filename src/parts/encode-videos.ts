import { Listr, ListrTask } from "listr2";
import path from "path";
import encodeVideo from "./encode-video";
import getSourceVideoInfo from "./get-source-video-info";
import getVideoParamsMatrix from "./get-video-params-matrix";

interface EncodeVideosOptions {
  inputFiles: string[];
  crfs: number[];
  bitrates: number[];
  outputPath: string;
}

const encodeVideos = async (options: EncodeVideosOptions) => {
  const { inputFiles, outputPath, crfs, bitrates } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const inputParts = path.parse(inputPath);
      const inputFile = inputParts.base;
      const { dimensions, fps, duration } = await getSourceVideoInfo(inputPath);

      const paramsMatrix = getVideoParamsMatrix({
        crfs,
        bitrates,
        fpses: [fps],
        dimensions: [
          {
            width: 720,
            height: 1280,
          },
        ],
      });

      const videoTasks = paramsMatrix.map((params) => {
        const stats = [
          params.dimension.width + "w",
          params.dimension.height + "h",
          params.fps + "fps",
          duration + "d",
          params.crf + "crf",
        ];
        const outputFilename = `${inputParts.name}-${stats.join("-")}.webm`;
        const output = path.resolve(outputPath, outputFilename);

        const listrTask: ListrTask = {
          title: `Encoding ${outputFilename}`,
          task: () =>
            encodeVideo({
              input: path.resolve(inputPath),
              output,
              crf: params.crf,
              bitrate: params.bitrate,
              height: params.dimension.height,
              width: params.dimension.width,
              fps: params.fps,
            }),
        };

        return listrTask;
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
