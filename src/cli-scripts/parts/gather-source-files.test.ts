import { gatherSourceFiles } from "./gather-source-files";
import glob from "glob";
import recursiveReadDir from "recursive-readdir";

jest.mock("glob");
jest.mock("recursive-readdir");

const mockGlob = glob as jest.Mocked<typeof glob>;
const mockRecursiveReadDir = recursiveReadDir as unknown as jest.MockedFunction<
  (
    dir: string,
    ignores?: Array<(file: string, stats: any) => boolean>
  ) => Promise<string[]>
>;

describe("gather-source-files", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("non-recursive mode", () => {
    test("should return files matching default extensions", async () => {
      mockGlob.sync.mockReturnValue([
        "file1.mov",
        "file2.mp4",
        "file3.webm",
        "file4.txt",
        "file5.jpg",
      ]);

      const result = await gatherSourceFiles(["*.mov", "*.mp4"]);

      expect(result).toEqual(["file1.mov", "file2.mp4", "file3.webm"]);
      expect(mockGlob.sync).toHaveBeenCalledWith("*.mov");
      expect(mockGlob.sync).toHaveBeenCalledWith("*.mp4");
    });

    test("should return files matching custom extensions", async () => {
      mockGlob.sync.mockReturnValue([
        "file1.mov",
        "file2.mp4",
        "file3.avi",
        "file4.mkv",
        "file5.txt",
      ]);

      const result = await gatherSourceFiles(
        ["*.mov", "*.avi"],
        ["avi", "mkv"]
      );

      expect(result).toEqual(["file3.avi", "file4.mkv"]);
    });

    test("should handle multiple glob patterns", async () => {
      mockGlob.sync
        .mockReturnValueOnce(["dir1/video1.mov", "dir1/video2.mp4"])
        .mockReturnValueOnce(["dir2/video3.webm"]);

      const result = await gatherSourceFiles(["dir1/*.mov", "dir2/*.webm"]);

      expect(result).toEqual([
        "dir1/video1.mov",
        "dir1/video2.mp4",
        "dir2/video3.webm",
      ]);
    });

    test("should deduplicate files from multiple glob patterns", async () => {
      mockGlob.sync
        .mockReturnValueOnce(["video1.mov", "video2.mp4"])
        .mockReturnValueOnce(["video1.mov", "video3.webm"]);

      const result = await gatherSourceFiles(["*.mov", "*.mp4"]);

      expect(result).toEqual(["video1.mov", "video2.mp4", "video3.webm"]);
    });

    test("should return empty array when no files match extensions", async () => {
      mockGlob.sync.mockReturnValue(["file1.txt", "file2.jpg", "file3.png"]);

      const result = await gatherSourceFiles(["*.txt"]);

      expect(result).toEqual([]);
    });

    test("should return empty array when glob returns no files", async () => {
      mockGlob.sync.mockReturnValue([]);

      const result = await gatherSourceFiles(["*.mov"]);

      expect(result).toEqual([]);
    });

    test("should handle case-insensitive extensions", async () => {
      mockGlob.sync.mockReturnValue([
        "file1.MOV",
        "file2.Mp4",
        "file3.WEBM",
        "file4.txt",
      ]);

      const result = await gatherSourceFiles(["*.*"]);

      // Note: The current implementation uses endsWith which is case-sensitive
      // This test documents current behavior
      expect(result).toEqual([]);
    });
  });

  describe("recursive mode", () => {
    test("should return files recursively with default extensions", async () => {
      // Mock recursive-readdir to return only files matching the extensions
      // (simulating what the ignore function would filter)
      mockRecursiveReadDir.mockResolvedValue([
        "dir1/subdir/video1.mov",
        "dir1/video2.mp4",
        "dir1/video3.webm",
      ]);

      const result = await gatherSourceFiles(
        ["dir1"],
        ["mov", "mp4", "webm"],
        true
      );

      expect(result).toEqual([
        "dir1/subdir/video1.mov",
        "dir1/video2.mp4",
        "dir1/video3.webm",
      ]);
      expect(mockRecursiveReadDir).toHaveBeenCalledWith(
        "dir1",
        expect.any(Array)
      );
    });

    test("should return files recursively with custom extensions", async () => {
      // Mock recursive-readdir to return only files matching the extensions
      mockRecursiveReadDir.mockResolvedValue([
        "dir1/video1.avi",
        "dir1/video2.mkv",
      ]);

      const result = await gatherSourceFiles(["dir1"], ["avi", "mkv"], true);

      expect(result).toEqual(["dir1/video1.avi", "dir1/video2.mkv"]);
    });

    test("should use ignore function to filter files", async () => {
      // Mock recursive-readdir to return only files matching the extensions
      mockRecursiveReadDir.mockResolvedValue([
        "dir1/video1.mov",
        "dir1/video2.mp4",
      ]);

      const result = await gatherSourceFiles(["dir1"], ["mov", "mp4"], true);

      expect(result).toEqual(["dir1/video1.mov", "dir1/video2.mp4"]);
      expect(mockRecursiveReadDir).toHaveBeenCalledWith(
        "dir1",
        expect.arrayContaining([expect.any(Function)])
      );
    });

    test("should return empty array when no files match in recursive mode", async () => {
      // Mock recursive-readdir to return empty array when no files match
      mockRecursiveReadDir.mockResolvedValue([]);

      const result = await gatherSourceFiles(["dir1"], ["mov", "mp4"], true);

      expect(result).toEqual([]);
    });

    test("should handle empty directory in recursive mode", async () => {
      mockRecursiveReadDir.mockResolvedValue([]);

      const result = await gatherSourceFiles(["dir1"], ["mov", "mp4"], true);

      expect(result).toEqual([]);
    });
  });

  describe("edge cases", () => {
    test("should handle empty input array", async () => {
      mockGlob.sync.mockReturnValue([]);

      const result = await gatherSourceFiles([]);

      expect(result).toEqual([]);
    });

    test("should handle empty extensions array", async () => {
      mockGlob.sync.mockReturnValue(["file1.mov", "file2.mp4", "file3.txt"]);

      const result = await gatherSourceFiles(["*.*"], []);

      expect(result).toEqual([]);
    });

    test("should handle files without extensions", async () => {
      mockGlob.sync.mockReturnValue(["file1.mov", "file2", "file3.mp4"]);

      const result = await gatherSourceFiles(["*.*"]);

      expect(result).toEqual(["file1.mov", "file3.mp4"]);
    });

    test("should handle files with multiple dots", async () => {
      mockGlob.sync.mockReturnValue([
        "file.name.mov",
        "file.name.mp4",
        "file.name.txt",
      ]);

      const result = await gatherSourceFiles(["*.*"]);

      expect(result).toEqual(["file.name.mov", "file.name.mp4"]);
    });
  });
});
