import { program } from "commander";
import prompts, { PromptObject } from "prompts";
import encodeVideos from "./parts/encode-videos";
import gatherSourceFiles from "./parts/gather-source-files";

const setupProgram = () => {
  program
    .requiredOption("-i, --input <inputs...>", "input file or directory")
    .option("-o, --output <output>", "output directory");

  program.parse(process.argv);

  return program;
};

const getIntArrayFromStringList = (input: string): number[] => {
  return input.split(",").map((part) => {
    const intVal = parseInt(part);
    if (isNaN(intVal)) throw `Error: "${part}" is not a number`;
    return intVal;
  });
};

const validateIntArray = (input: string): boolean | string => {
  try {
    getIntArrayFromStringList(input);
    return true;
  } catch (e) {
    return String(e);
  }
};

const questions: PromptObject[] = [
  {
    type: "text",
    name: "crf",
    message: "-crf value?",
    initial: "30",
    validate: validateIntArray,
    format: getIntArrayFromStringList,
  },
  {
    type: "text",
    name: "fps",
    message: "fps?",
    initial: "60",
    validate: validateIntArray,
    format: getIntArrayFromStringList,
  },
];

(async () => {
  const program = setupProgram();
  const options = program.opts();
  const inputFiles = gatherSourceFiles(options.input);

  console.log(`Found ${inputFiles.length} input videos`);

  const response = await prompts(questions);

  await encodeVideos({
    inputFiles: inputFiles,
    outputPath: options.output,
    crfs: response.crf,
    fpses: response.fps,
    bitrates: [50000],
  });
})();
