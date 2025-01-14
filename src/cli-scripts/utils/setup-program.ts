import { program } from "commander";

export const setupProgram = () => {
  program
    .requiredOption("-i, --input <inputs...>", "input file or directory")
    .option("-o, --output <output>", "output directory")
    .option("-r", "--recursive <recursive>", false);

  program.parse(process.argv);

  return program;
};
