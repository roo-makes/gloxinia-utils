import glob from "glob";

export default (inputArr: string[]) => {
  const inputSet = new Set(inputArr.flatMap((entry) => glob.sync(entry)));

  return [...inputSet].filter(
    (inputFile) =>
      inputFile.endsWith(".mov") ||
      inputFile.endsWith(".mp4" || inputFile.endsWith(".webm"))
  );
};
