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

  const outputFilename =
    [inputParts.name, ...(outputFilenameExtras || [])].join("-") +
    `.${outputExtension}`;

  const outputPath = path.resolve(outputDir, `${outputFilename}`);

  return {
    outputDir,
    outputFilename,
    outputPath,
  };
};
