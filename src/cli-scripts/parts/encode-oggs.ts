import { Listr, ListrTask } from "listr2";
import path from "path";
import { fileExistsAndIsNewerSync } from "../utils/file-exists-and-is-newer";
import { getOutputPath } from "../utils/get-output-path";
import encodeOgg from "./ffmpeg/encode-ogg";

interface EncodeOggsOptions {
  inputFiles: string[];
  inputBasePath: string;
  outputBasePath: string;
}

const encodeOggs = async (options: EncodeOggsOptions) => {
  const { inputFiles, outputBasePath, inputBasePath } = options;

  const tasks = inputFiles.flatMap((inputPath) => {
    const { outputPath, outputFilename } = getOutputPath({
      inputPath,
      inputBasePath,
      outputBasePath,
      outputExtension: "ogg",
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
      task: () => {
        return encodeOgg({
          input: path.resolve(inputPath),
          output: outputPath,
        });
      },
    };

    return [listrTask];
  });

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};

export default encodeOggs;
