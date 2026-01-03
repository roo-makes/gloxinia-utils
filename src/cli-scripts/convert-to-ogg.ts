import prompts, { PromptObject } from "prompts";
import { gatherSourceFiles } from "./parts/gather-source-files";
import encodeOggs from "./parts/encode-oggs";
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
    inputExts: ["mp3", "wav", "m4a", "ogg"],
    inputBasePath,
  });

  if (inputFiles.length === 0) {
    console.error("No input files found");
    process.exit(1);
  } else {
    console.log(`Found ${inputFiles.length} input videos`);
  }

  await runPromptsWithConfirm();

  await encodeOggs({
    inputFiles,
    inputBasePath,
    outputBasePath: options.output.trim(),
  });
})();
