import { gatherSourceFiles } from "./parts/gather-source-files";
import { encodeImageSequences } from "./parts/encode-image-sequences";
import { setupProgram } from "./utils/setup-program";
import { runPromptsWithConfirm } from "./utils/run-prompts-with-confirm";
import { encodeImagePlaceholders } from "./parts/encode-image-placeholders";

(async () => {
  const program = setupProgram((program) => {
    program.option("--placeholders", "Extract placeholders only");
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

  await runPromptsWithConfirm();

  if (options.placeholders) {
    await encodeImagePlaceholders({
      inputFiles,
      inputBasePath,
      outputBasePath: options.output,
    });
  } else {
    await encodeImageSequences({
      inputFiles,
      inputBasePath,
      outputBasePath: options.output,
    });
  }
})();
