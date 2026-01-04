import decompress from "decompress";
import tmp from "tmp-promise";
import { existsSync, statSync } from "fs";

// Dynamic import for zip-a-folder to fix ESM/CJS interop issue
export const unzip = async (zipPath: string): Promise<string> => {
  const outDir = await tmp.dir({ unsafeCleanup: true });
  await decompress(zipPath, outDir.path);
  return outDir.path;
};

export const zipFolder = async (dirPath: string): Promise<string> => {
  const { zip } = await import("zip-a-folder");
  // Create a temp directory and put the zip file there
  // zip-a-folder may need to create the file itself
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
  const zipPath = `${tmpDir.path}/build.zip`;

  console.log(`Zipping ${dirPath} to ${zipPath}`);
  await zip(dirPath, zipPath);

  // Verify the zip file was created and is actually a file
  if (!existsSync(zipPath)) {
    throw new Error(`Failed to create zip file at ${zipPath}`);
  }
  const stats = statSync(zipPath);
  if (!stats.isFile()) {
    throw new Error(`Zip path is not a file: ${zipPath}`);
  }

  return zipPath;
};
