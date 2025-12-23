import { statSync } from "fs-extra";
import path from "path";

export const getInputBasePath = (input: string[]) => {
  // If input is a directory, return the directory
  // If input is a file, return the directory of the file
  if (statSync(input[0]).isDirectory()) {
    return input[0].replace(/\/$/, "");
  } else {
    return path.dirname(input[0]).replace(/\/$/, "");
  }
};
