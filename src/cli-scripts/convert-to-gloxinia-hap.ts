import { encodeVideos } from "./parts/encode-videos";
import { gatherSourceFiles } from "./parts/gather-source-files";
import {
  validateIntArray,
  getIntArrayFromStringList,
} from "./utils/get-int-array-from-string-list";
import { setupProgram } from "./utils/setup-program";
import { runPromptsWithConfirm } from "./utils/run-prompts-with-confirm";

(async () => {
  const program = setupProgram();
  const options = program.opts();
  const inputBasePath = options.inputBasePath
    ? String(options.inputBasePath)
    : "";
  const inputFiles = await gatherSourceFiles({
    inputArg: options.input,
    inputExts: ["mov"],
    inputBasePath,
  });

  if (inputFiles.length === 0) {
    console.error("No input files found");
    process.exit(1);
  } else {
    console.log(`Found ${inputFiles.length} input videos`);
  }

  const response = await runPromptsWithConfirm([
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
    outputFormat: "hap",
    fpses: response.fps,
  });
})();
