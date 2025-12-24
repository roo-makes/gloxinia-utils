import { Command } from "commander";

export const setupProgram = (
  onBeforeParse?: (program: Command) => void
): Command => {
  const program = new Command();
  program
    .requiredOption("-i, --input <inputs...>", "input file or directory(s)")
    .requiredOption("-o, --output <output>", "output base directory")
    .option("--inputBasePath <inputBasePath>", "input base directory");

  if (onBeforeParse) {
    onBeforeParse(program);
  }

  program.parse(process.argv);

  program.showHelpAfterError(true);

  return program;
};
