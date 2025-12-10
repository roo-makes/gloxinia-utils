import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import { fileExistsAndIsNewerSync } from "../utils/file-exists-and-is-newer";
import { getOutputPath } from "../utils/get-output-path";
import encodeOgg from "./ffmpeg/encode-ogg";

interface EncodeOggsOptions {
  inputFiles: string[];
  inputBasePath: string;
  outputPath: string;
  overwrite?: boolean;
}

const encodeOggs = async (options: EncodeOggsOptions) => {
  const { inputFiles, outputPath, inputBasePath, overwrite } = options;

  const tasks = inputFiles.flatMap((inputPath) => {
    const { outputPath: outputPathForFile, outputFilename } = getOutputPath({
      inputPath,
      inputBasePath,
      outputBasePath: outputPath,
      outputExtension: "ogg",
    });

    if (
      fileExistsAndIsNewerSync({
        inputPath,
        outputPath: outputPathForFile,
      }) &&
      !overwrite
    ) {
      console.log(`Skipping ${outputFilename} -- exists and is newer.`);
      return [];
    }

    const listrTask: ListrTask = {
      title: `Encoding ${outputFilename}`,
      task: () => {
        return encodeOgg({
          input: inputPath,
          output: outputPathForFile,
        });
      },
    };

    return [listrTask];
  });

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};

export default encodeOggs;
