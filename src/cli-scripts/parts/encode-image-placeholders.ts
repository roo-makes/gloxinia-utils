import { Listr, ListrTask } from "listr2";
import path from "path";
import { ensureDir } from "fs-extra";
import { Size } from "../types/common";
import { encodeImageSequence } from "./ffmpeg/encode-image-sequence";
import getSourceVideoInfo from "./get-source-video-info";
import { getSizesForInputFile } from "./get-sizes-for-input-file";
import { getOutputPath } from "../utils/get-output-path";

type EncodeImagePlaceholdersOptions = {
  /** Input filepaths to encode. They are expected to be relative to inputBasePath. */
  inputFiles: string[];
  /** The root path for the input files. Output relative paths will be derived from the difference between input and inputBasePath. */
  inputBasePath: string;
  /** The root path for the output files. Output filepaths will be relative to this path. */
  outputBasePath: string;
  /** The sizes to encode the images to. */
  sizes?: Size[];
};

/**
 * In placeholders only mode, we need to extract the first frame of each sequence. We only need it in the largest size.
 * The output should be a single file with the source filename plus `-placeholder.png`.
 */
export const encodeImagePlaceholders = async (
  options: EncodeImagePlaceholdersOptions
) => {
  const { inputFiles, inputBasePath, outputBasePath, sizes } = options;

  const tasks = await Promise.all(
    inputFiles.map(async (inputPath) => {
      const videoInfo = await getSourceVideoInfo(inputPath);

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

      const largestSize = sizesForInputFile.reduce((a, b) =>
        a.width > b.width ? a : b
      );

      const videoTasks = [largestSize].flatMap((size) => {
        const { outputFilename, outputDir } = getOutputPath({
          inputPath,
          inputBasePath,
          outputBasePath,
          outputFilenameExtras: ["placeholder"],
        });

        ensureDir(outputDir);

        const listrTask: ListrTask = {
          title: `Extracting to ${outputFilename}`,
          task: () =>
            encodeImageSequence({
              input: path.resolve(inputPath),
              outputDir,
              outputPrefix: outputFilename,
              includeFrameNumbers: false,
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
