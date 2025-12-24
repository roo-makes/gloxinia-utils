import { globSync } from "glob";
import path from "path";

const getGlobFiles = (inputArr: string[], inputBasePath?: string): string[] => {
  console.log({ inputArr, inputBasePath });
  let files = inputArr.flatMap((input) => {
    return inputBasePath
      ? globSync(input, { cwd: inputBasePath })
      : globSync(input);
  });
  // Reattach the input base path to the files
  if (inputBasePath) {
    files = files.map((file) => {
      return path.join(inputBasePath, file);
    });
  }

  return [...new Set(files)];
};

const getStringArrayFromInputArg = (inputArg: any): string[] => {
  return Array.isArray(inputArg) ? inputArg : [inputArg];
};

type GatherSourceFilesOptions = {
  inputArg: any;
  inputExts: string[];
  inputBasePath?: string;
};

export const gatherSourceFiles = async (options: GatherSourceFilesOptions) => {
  const { inputArg, inputExts, inputBasePath } = options;
  const inputArray = getStringArrayFromInputArg(inputArg);

  const files = await getGlobFiles(inputArray, inputBasePath);

  return files.filter((inputFile) => {
    const matchesExtensions = inputExts.some((ext) =>
      inputFile.endsWith(`.${ext}`)
    );
    return matchesExtensions;
  });
};
