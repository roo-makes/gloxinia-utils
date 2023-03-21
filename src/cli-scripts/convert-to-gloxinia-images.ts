import { program } from "commander";
import prompts, { PromptObject } from "prompts";
import path from "path";
import encodeImageSequences from "./parts/encode-image-sequences";
import gatherSourceFiles from "./parts/gather-source-files";
import getSizesForRatio from "./parts/get-sizes-for-ratio";
import getSourceVideoInfo from "./parts/get-source-video-info";

const setupProgram = () => {
  program
    .requiredOption("-i, --input <inputs...>", "input file or directory")
    .option("-o, --output <output>", "output directory");

  program.parse(process.argv);

  return program;
};

(async () => {
  const program = setupProgram();
  const options = program.opts();
  const inputFiles = gatherSourceFiles(options.input);

  console.log(`Found ${inputFiles.length} input videos`);
  if (inputFiles.length === 0) return;

  const videoInfo = await getSourceVideoInfo(inputFiles[0]);

  const response = await prompts([
    {
      type: "multiselect",
      message: "Select output sizes (spacebar to toggle)",
      instructions: false,
      name: "sizes",
      choices: getSizesForRatio(
        videoInfo.size.width / videoInfo.size.height
      ).map((size) => {
        return {
          title: `${size.width} x ${size.height}`,
          value: size,
          selected: true,
        };
      }),
      min: 1,
    },
  ]);

  await encodeImageSequences({
    inputFiles,
    outputPath: options.output,
    sizes: response.sizes,
  });
})();
