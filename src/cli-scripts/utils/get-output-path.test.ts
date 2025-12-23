import { getOutputPath } from "./get-output-path";
import path from "path";

describe("getOutputPath", () => {
  describe("basic functionality", () => {
    test("should preserve subdirectory structure with trailing slashes", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "/path/to/input/",
        outputBasePath: "/path/to/output/",
        outputFilenameExtras: ["extra"],
        outputExtension: "webm",
      });

      expect(result.outputDir).toBe(path.resolve("/path/to/output/subdir"));
      expect(result.outputFilename).toBe("file-extra.webm");
      expect(result.outputPath).toBe(
        path.resolve("/path/to/output/subdir/file-extra.webm")
      );
    });

    test("should preserve subdirectory structure without trailing slashes", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputFilenameExtras: ["extra"],
        outputExtension: "webm",
      });

      expect(result.outputDir).toBe(path.resolve("/path/to/output/subdir"));
      expect(result.outputFilename).toBe("file-extra.webm");
      expect(result.outputPath).toBe(
        path.resolve("/path/to/output/subdir/file-extra.webm")
      );
    });

    test("should handle root-level files (no subdirectory)", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputFilenameExtras: ["extra"],
        outputExtension: "webm",
      });

      expect(result.outputDir).toBe(path.resolve("/path/to/output"));
      expect(result.outputFilename).toBe("file-extra.webm");
      expect(result.outputPath).toBe(
        path.resolve("/path/to/output/file-extra.webm")
      );
    });

    test("should handle deeply nested subdirectories", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/level1/level2/level3/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputFilenameExtras: ["extra"],
        outputExtension: "webm",
      });

      expect(result.outputDir).toBe(
        path.resolve("/path/to/output/level1/level2/level3")
      );
      expect(result.outputFilename).toBe("file-extra.webm");
      expect(result.outputPath).toBe(
        path.resolve("/path/to/output/level1/level2/level3/file-extra.webm")
      );
    });
  });

  describe("outputFilenameExtras", () => {
    test("should work without outputFilenameExtras", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputExtension: "webm",
      });

      expect(result.outputFilename).toBe("file.webm");
    });

    test("should handle multiple outputFilenameExtras", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputFilenameExtras: ["extra1", "extra2", "extra3"],
        outputExtension: "webm",
      });

      expect(result.outputFilename).toBe("file-extra1-extra2-extra3.webm");
    });

    test("should filter out empty and falsy values from outputFilenameExtras", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputFilenameExtras: [
          "extra1",
          "",
          "extra2",
          null as any,
          undefined as any,
          "extra3",
        ],
        outputExtension: "webm",
      });

      expect(result.outputFilename).toBe("file-extra1-extra2-extra3.webm");
    });

    test("should handle empty outputFilenameExtras array", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputFilenameExtras: [],
        outputExtension: "webm",
      });

      expect(result.outputFilename).toBe("file.webm");
    });
  });

  describe("file extensions and names", () => {
    test("should handle files with no extension", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputExtension: "webm",
      });

      expect(result.outputFilename).toBe("file.webm");
    });

    test("should handle files with multiple dots", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.name.mov",
        inputBasePath: "/path/to/input",
        outputBasePath: "/path/to/output",
        outputExtension: "webm",
      });

      expect(result.outputFilename).toBe("file.name.webm");
    });

    test("should handle different output extensions", () => {
      const extensions = ["webm", "mp4", "mov", "hap", "ogg"];

      extensions.forEach((ext) => {
        const result = getOutputPath({
          inputPath: "/path/to/input/subdir/file.mov",
          inputBasePath: "/path/to/input",
          outputBasePath: "/path/to/output",
          outputExtension: ext,
        });

        expect(result.outputFilename).toBe(`file.${ext}`);
      });
    });
  });

  describe("edge cases", () => {
    test("should handle empty inputBasePath", () => {
      const result = getOutputPath({
        inputPath: "/path/to/input/subdir/file.mov",
        inputBasePath: "",
        outputBasePath: "/path/to/output",
        outputExtension: "webm",
      });

      // When inputBasePath is empty, inputPathAfterBase becomes empty string
      // So outputDir should just be the outputBasePath
      expect(result.outputDir).toBe(path.resolve("/path/to/output"));
      expect(result.outputFilename).toBe("file.webm");
    });

    test("should handle relative paths", () => {
      const result = getOutputPath({
        inputPath: "./input/subdir/file.mov",
        inputBasePath: "./input",
        outputBasePath: "./output",
        outputExtension: "webm",
      });

      // path.resolve will convert relative paths to absolute
      expect(result.outputDir).toContain("output");
      expect(result.outputDir).toContain("subdir");
      expect(result.outputFilename).toBe("file.webm");
    });
  });
});
