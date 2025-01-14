import exp from "constants";
import { getOutputPath } from "./get-output-path";

test("works with trailing slash", () => {
  const result = getOutputPath({
    inputPath: "/path/to/input/subdir/file.mov",
    inputBasePath: "/path/to/input/",
    outputBasePath: "/path/to/output/",
    outputFilenameExtras: ["extra"],
    outputExtension: "webm",
  });

  expect(result).toEqual({
    outputDir: "/path/to/output/subdir",
    outputFilename: "file-extra.webm",
    outputPath: "/path/to/output/subdir/file-extra.webm",
  });
});

test("works without trailing slash", () => {
  const result = getOutputPath({
    inputPath: "/path/to/input/subdir/file.mov",
    inputBasePath: "/path/to/input",
    outputBasePath: "/path/to/output",
    outputFilenameExtras: ["extra"],
    outputExtension: "webm",
  });

  expect(result).toEqual({
    outputDir: "/path/to/output/subdir",
    outputFilename: "file-extra.webm",
    outputPath: "/path/to/output/subdir/file-extra.webm",
  });
});
