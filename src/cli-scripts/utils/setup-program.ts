import { Command } from "commander";

export const setupProgram = (): Command => {
  const program = new Command();
  program
    .requiredOption("-i, --input <inputs...>", "input file or directory(s)")
    .requiredOption("-o, --output <output>", "output base directory")
    .option("--inputBasePath <inputBasePath>", "input base directory")
    .option("-r, --recursive", "recursively search for input files", false);

  program.parse(process.argv);

  program.showHelpAfterError(true);

  return program;
};
