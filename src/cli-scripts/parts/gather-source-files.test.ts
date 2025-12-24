import { gatherSourceFiles } from "./gather-source-files";
import glob from "glob";

jest.mock("glob", () => ({
  globSync: jest.fn(),
}));

const mockGlob = glob as jest.Mocked<typeof glob>;

describe("gather-source-files", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("non-recursive mode", () => {
    test("should return files matching input extensions", async () => {
      mockGlob.globSync.mockReturnValue([
        "file1.mov",
        "file2.mp4",
        "file3.webm",
        "file4.txt",
        "file5.jpg",
      ]);

      const result = await gatherSourceFiles({
        inputArg: ["*"],
        inputExts: ["mov", "mp4"],
      });

      expect(result).toEqual(["file1.mov", "file2.mp4"]);
      expect(mockGlob.globSync).toHaveBeenCalledWith("*");
    });

    test("should handle multiple glob patterns", async () => {
      mockGlob.globSync
        .mockReturnValueOnce(["dir1/video1.mov", "dir1/video2.mp4"])
        .mockReturnValueOnce(["dir2/video3.webm"]);

      const result = await gatherSourceFiles({
        inputArg: ["dir1/*.mov", "dir2/*.webm"],
        inputExts: ["mov", "webm"],
      });

      expect(result).toEqual(["dir1/video1.mov", "dir2/video3.webm"]);
    });

    test("should deduplicate files from multiple glob patterns", async () => {
      mockGlob.globSync
        .mockReturnValueOnce(["video1.mov", "video2.mp4"])
        .mockReturnValueOnce(["video1.mov", "video3.webm"]);

      const result = await gatherSourceFiles({
        inputArg: ["*.mov", "*.mp4"],
        inputExts: ["mov", "mp4"],
      });

      expect(result).toEqual(["video1.mov", "video2.mp4"]);
    });

    test("should return empty array when no files match extensions", async () => {
      mockGlob.globSync.mockReturnValue([
        "file1.txt",
        "file2.jpg",
        "file3.png",
      ]);

      const result = await gatherSourceFiles({
        inputArg: ["*.txt"],
        inputExts: ["mov"],
      });

      expect(result).toEqual([]);
    });

    test("should return empty array when glob returns no files", async () => {
      mockGlob.globSync.mockReturnValue([]);

      const result = await gatherSourceFiles({
        inputArg: ["*.mov"],
        inputExts: ["mov"],
      });

      expect(result).toEqual([]);
    });
  });

  describe("recursive search", () => {
    test("should return files recursively with default extensions", async () => {
      // Mock fs.readdirSync to return files (fs.readdirSync returns relative paths,
      // but the implementation may join them with the input directory)
      mockGlob.globSync.mockReturnValue([
        "subdir/video1.mov",
        "video2.mp4",
        "video3.webm",
      ]);

      const result = await gatherSourceFiles({
        inputArg: ["dir1/**/*"],
        inputExts: ["mov", "mp4", "webm"],
      });

      expect(result).toEqual([
        "subdir/video1.mov",
        "video2.mp4",
        "video3.webm",
      ]);
      expect(mockGlob.globSync).toHaveBeenCalledWith("dir1/**/*");
    });
  });

  describe("input base path", () => {
    test("should return files relative to input base path", async () => {
      mockGlob.globSync.mockReturnValue([
        "subdir/video1.mov",
        "video2.mp4",
        "video3.webm",
      ]);

      const result = await gatherSourceFiles({
        inputArg: ["**/*"],
        inputExts: ["mov", "mp4", "webm"],
        inputBasePath: "dir1",
      });

      expect(result).toEqual([
        "dir1/subdir/video1.mov",
        "dir1/video2.mp4",
        "dir1/video3.webm",
      ]);
      expect(mockGlob.globSync).toHaveBeenCalledWith("**/*", { cwd: "dir1" });
    });
  });
});
