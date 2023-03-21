import { program } from "commander";
import prompts, { PromptObject } from "prompts";
import gatherSourceFiles from "./parts/gather-source-files";
import encodeOggs from "./parts/encode-oggs";

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
    type: "confirm",
    name: "confirm",
    message: "Start Conversion?",
    initial: true,
  },
];

(async () => {
  const program = setupProgram();
  const options = program.opts();
  const inputFiles = gatherSourceFiles(options.input, [
    "mp3",
    "wav",
    "m4a",
    "ogg",
  ]);

  console.log(`Found ${inputFiles.length} input audio files.`);

  await prompts(questions);

  await encodeOggs({
    inputFiles,
    outputPath: options.output,
  });
})();
