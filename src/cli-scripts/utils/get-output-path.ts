import path from "path";

type GetOutputPathOptions = {
  inputPath: string;
  inputBasePath: string;
  outputBasePath: string;
  outputFilenameExtras?: string[];
  outputExtension: string;
};

const removeStartingSlash = (path: string) =>
  path.startsWith("/") ? path.slice(1) : path;

export const getOutputPath = ({
  inputPath,
  inputBasePath,
  outputBasePath,
  outputFilenameExtras,
  outputExtension,
}: GetOutputPathOptions) => {
  const inputParts = path.parse(inputPath);
  const inputPathAfterBase = inputBasePath
    ? path.dirname(inputPath.replace(inputBasePath, ""))
    : "";

  const outputDir = path.resolve(
    outputBasePath,
    removeStartingSlash(inputPathAfterBase)
  );

  // Generate the output filename by joining the input filename with the extras (used for stats)
  const outputFilename =
    [inputParts.name, ...(outputFilenameExtras || []).filter(Boolean)].join(
      "-"
    ) + `.${outputExtension}`;

  const outputPath = path.resolve(outputDir, `${outputFilename}`);

  return {
    outputDir,
    outputFilename,
    outputPath,
  };
};
