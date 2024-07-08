import { existsSync } from "fs";
import { Listr, ListrTask } from "listr2";
import path from "path";
import encodeOgg from "./encode-ogg";

interface EncodeOggsOptions {
  inputFiles: string[];
  inputBasePath?: string;
  outputPath: string;
  overwrite?: boolean;
}

const encodeOggs = async (options: EncodeOggsOptions) => {
  const { inputFiles, outputPath, inputBasePath, overwrite } = options;

  const tasks = inputFiles.flatMap((inputPath) => {
    const inputParts = path.parse(inputPath);
    const outputFilename = `${inputParts.name}.ogg`;

    const inputPathAfterBase = inputBasePath
      ? path.dirname(inputPath.replace(inputBasePath, ""))
      : "";

    const output = path.resolve(outputPath, inputPathAfterBase, outputFilename);

    if (existsSync(output) && !overwrite) {
      console.log(`Skipping ${outputFilename} as it already exists.`);
      return [];
    }

    const listrTask: ListrTask = {
      title: `Encoding ${outputFilename}`,
      task: () => {
        return encodeOgg({
          input: inputPath,
          output,
        });
      },
    };

    return [listrTask];
  });

  const listrTasks = new Listr(tasks, { concurrent: false });

  await listrTasks.run();
};

export default encodeOggs;
