import { program } from "commander";
import prompts, { PromptObject } from "prompts";
import gatherSourceFiles from "./parts/gather-source-files";
import encodeOggs from "./parts/encode-oggs";

const setupProgram = () => {
  program
    .requiredOption("-i, --input <inputs...>", "input file or directory")
    .option("-o, --output <output>", "output directory")
    .option("-r", "--recursive <recursive>", false);

  program.parse(process.argv);

  return program;
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
  const inputFiles = await gatherSourceFiles(
    options.input,
    ["mp3", "wav", "m4a", "ogg"],
    options.r
  );

  console.log(`Found ${inputFiles.length} input audio files.`);

  await prompts(questions);

  if (options.r) {
    await encodeOggs({
      inputFiles,
      inputBasePath: options.input[0],
      outputPath: options.output,
    });
  } else {
    await encodeOggs({
      inputFiles,
      outputPath: options.output,
    });
  }
})();
