import glob from "glob";
import path from "path";
import recursiveReadDir from "recursive-readdir";

const getIgnoreFunc = (inputExts: string[]) => {
  return (file: string, stats: any) => {
    if (stats.isDirectory()) {
      return false;
    }

    return !inputExts.some((ext) => path.extname(file).endsWith(ext));
  };
};

const getFilesRecursive = async (
  inputArr: string[],
  inputExts: string[]
): Promise<string[]> => {
  const files = await recursiveReadDir(inputArr[0], [getIgnoreFunc(inputExts)]);

  return files;
};

export default async (
  inputArr: string[],
  inputExts: string[] = ["mov", "mp4", "webm"],
  recursive = false
) => {
  if (recursive) {
    return getFilesRecursive(inputArr, inputExts);
  }

  const inputSet = new Set(
    inputArr.flatMap((entry) => {
      return glob.sync(entry);
    })
  );

  return [...inputSet].filter((inputFile) =>
    inputExts.some((ext) => inputFile.endsWith(`.${ext}`))
  );
};
