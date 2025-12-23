import prompts from "prompts";
import {
  getIntArrayFromStringList,
  validateIntArray,
} from "./utils/get-int-array-from-string-list";
import { gatherSourceFiles } from "./parts/gather-source-files";
import { setupProgram } from "./utils/setup-program";
import { encodeVideos } from "./parts/encode-videos";
import { getInputBasePath } from "./utils/get-input-base-path";

(async () => {
  const program = setupProgram();
  const options = program.opts();
  const inputFiles = await gatherSourceFiles(
    options.input,
    ["mov"],
    Boolean(options.recursive)
  );
  const inputBasePath = options.inputBasePath
    ? String(options.inputBasePath)
    : getInputBasePath(options.input);

  if (inputFiles.length === 0) {
    console.error("No input files found");
    process.exit(1);
  } else {
    console.log(`Found ${inputFiles.length} input videos`);
  }

  const response = await prompts([
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
  ]);

  await encodeVideos({
    inputFiles,
    inputBasePath,
    outputBasePath: options.output,
    outputFormat: "webm",
    fpses: response.fps,
    crfs: response.crf,
  });
})();
