import glob from "glob";

export default (
  inputArr: string[],
  inputExts: string[] = ["mov", "mp4", "webm"]
) => {
  const inputSet = new Set(inputArr.flatMap((entry) => glob.sync(entry)));

  return [...inputSet].filter((inputFile) =>
    inputExts.some((ext) => inputFile.endsWith(`.${ext}`))
  );
};
