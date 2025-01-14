import fsExtra from "fs-extra";

type FileExistsAndIsNewerOptions = {
  outputPath: string;
  inputPath: string;
};

export const fileExistsAndIsNewer = async ({
  outputPath,
  inputPath,
}: FileExistsAndIsNewerOptions) => {
  if (!fsExtra.existsSync(outputPath)) return false;

  const outputStats = await fsExtra.stat(outputPath);
  const inputStats = await fsExtra.stat(inputPath);

  return outputStats.mtimeMs > inputStats.mtimeMs;
};

export const fileExistsAndIsNewerSync = ({
  outputPath,
  inputPath,
}: FileExistsAndIsNewerOptions) => {
  if (!fsExtra.existsSync(outputPath)) return false;

  const outputStats = fsExtra.statSync(outputPath);
  const inputStats = fsExtra.statSync(inputPath);

  return outputStats.mtimeMs > inputStats.mtimeMs;
};
