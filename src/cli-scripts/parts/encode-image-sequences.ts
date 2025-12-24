import { Listr, ListrTask } from "listr2";
import path from "path";
import { ensureDir } from "fs-extra";
import { Size } from "../types/common";
import { encodeImageSequence } from "./ffmpeg/encode-image-sequence";
import getSourceVideoInfo from "./get-source-video-info";
import { getSizesForInputFile } from "./get-sizes-for-input-file";
import { getOutputPath } from "../utils/get-output-path";

interface EncodeImageSequencesOptions {
  /** Input filepaths to encode. They are expected to be relative to inputBasePath. */
  inputFiles: string[];
  /** The root path for the input files. Output relative paths will be derived from the difference between input and inputBasePath. */
  inputBasePath: string;
  /** The root path for the output files. Output filepaths will be relative to this path. */
  outputBasePath: string;
  /** The sizes to encode the images to. */
  sizes?: Size[];
}

/**
 * In sequences mode, we need to extract the entire sequence. The output should be in a directory with the source's filename,
 * plus the size and frame count (shady-nightclub-basic-idle-720w-960h-30d/output-0001.png)
 */
export const encodeImageSequences = async (
  options: EncodeImageSequencesOptions
) => {
  const { inputFiles, inputBasePath, outputBasePath, sizes } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const videoInfo = await getSourceVideoInfo(inputPath);
      const { duration } = videoInfo;

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

      const videoTasks = sizesForInputFile.flatMap((size) => {
        const stats = [size.width + "w", size.height + "h", duration + "d"];
        const { outputFilename, outputPath } = getOutputPath({
          inputPath,
          inputBasePath,
          outputBasePath,
          outputFilenameExtras: stats,
        });

        ensureDir(outputPath);

        const listrTask: ListrTask = {
          title: `Extracting to ${outputFilename}`,
          task: () =>
            encodeImageSequence({
              input: path.resolve(inputPath),
              outputDir: outputPath,
              size,
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
