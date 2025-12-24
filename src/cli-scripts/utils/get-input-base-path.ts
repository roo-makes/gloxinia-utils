import { statSync } from "fs-extra";
import path from "path";
import { globSync } from "glob";

export const getInputBasePath = (input: string[]) => {
  const files = globSync(input);
  const basePaths = files.map((file) => path.dirname(file).replace(/\/$/, ""));

  console.log("basePaths", basePaths);

  return basePaths[0];
};
