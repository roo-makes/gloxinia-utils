import {
  getIntArrayFromStringList,
  validateIntArray,
} from "./utils/get-int-array-from-string-list";
import { gatherSourceFiles } from "./parts/gather-source-files";
import { setupProgram } from "./utils/setup-program";
import { encodeVideos } from "./parts/encode-videos";
import { runPromptsWithConfirm } from "./utils/run-prompts-with-confirm";

(async () => {
  const program = setupProgram((program) => {
    program.option("--no-alpha", "Encode without alpha channel");
  });
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
    outputFormat: options.alpha ? "webm" : "webmNoAlpha",
    fpses: response.fps,
    crfs: response.crf,
  });
})();
