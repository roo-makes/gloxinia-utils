import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import { ensureDir } from "fs-extra";
import { Size } from "../types/common";
import encodeImageSequence from "./ffmpeg/encode-image-sequence";
import getSizesForRatio from "./get-sizes-for-ratio";
import getSourceVideoInfo from "./get-source-video-info";

interface EncodeImageSequencesOptions {
  inputFiles: string[];
  outputPath: string;
  sizes: Size[];
}

const encodeVideos = async (options: EncodeImageSequencesOptions) => {
  const { inputFiles, outputPath, sizes } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const inputParts = path.parse(inputPath);
      const inputFile = inputParts.base;
      const { duration } = await getSourceVideoInfo(inputPath);

      const videoTasks = sizes.flatMap((size) => {
        const stats = [size.width + "w", size.height + "h", duration + "d"];
        const outputPrefix = `${inputParts.name}-${stats.join("-")}`;
        const output = path.resolve(outputPath, outputPrefix + "/");

        ensureDir(output);

        if (existsSync(output)) return [];

        const listrTask: ListrTask = {
          title: `Extracting to ${outputPrefix}`,
          task: () =>
            encodeImageSequence({
              input: path.resolve(inputPath),
              output,
              outputPrefix,
              size,
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
