import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import encodeOgg from "./encode-ogg";

interface EncodeOggsOptions {
  inputFiles: string[];
  outputPath: string;
}

const encodeOggs = async (options: EncodeOggsOptions) => {
  const { inputFiles, outputPath } = options;

  const tasks = inputFiles.flatMap((inputPath) => {
    const inputParts = path.parse(inputPath);
    const outputFilename = `${inputParts.name}.ogg`;
    const output = path.resolve(outputPath, outputFilename);

    if (existsSync(output)) return [];

    const listrTask: ListrTask = {
      title: `Encoding ${outputFilename}`,
      task: () =>
        encodeOgg({
          input: inputPath,
          output,
        }),
    };

    return [listrTask];
  });

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};

export default encodeOggs;
