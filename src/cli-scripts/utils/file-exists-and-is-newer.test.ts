import {
  fileExistsAndIsNewer,
  fileExistsAndIsNewerSync,
} from "./file-exists-and-is-newer";
import fsExtra from "fs-extra";

jest.mock("fs-extra");

describe("fileExistsAndIsNewer", () => {
  const mockExistsSync = fsExtra.existsSync as jest.Mock;
  const mockStat = fsExtra.stat as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns false if the output file does not exist", async () => {
    mockExistsSync.mockReturnValue(false);

    const result = await fileExistsAndIsNewer({
      outputPath: "output.file",
      inputPath: "input.file",
    });

    expect(result).toBe(false);
    expect(mockExistsSync).toHaveBeenCalledWith("output.file");
  });

  test("returns true if output file is newer than input file", async () => {
    mockExistsSync.mockReturnValue(true);
    mockStat.mockImplementation((path: string) => {
      return Promise.resolve({
        mtimeMs: path === "output.file" ? 2000 : 1000,
      });
    });

    const result = await fileExistsAndIsNewer({
      outputPath: "output.file",
      inputPath: "input.file",
    });

    expect(result).toBe(true);
    expect(mockStat).toHaveBeenCalledWith("output.file");
    expect(mockStat).toHaveBeenCalledWith("input.file");
  });

  test("returns false if output file is older than input file", async () => {
    mockExistsSync.mockReturnValue(true);
    mockStat.mockImplementation((path: string) => {
      return Promise.resolve({
        mtimeMs: path === "output.file" ? 1000 : 2000,
      });
    });

    const result = await fileExistsAndIsNewer({
      outputPath: "output.file",
      inputPath: "input.file",
    });

    expect(result).toBe(false);
    expect(mockStat).toHaveBeenCalledWith("output.file");
    expect(mockStat).toHaveBeenCalledWith("input.file");
  });
});

describe("fileExistsAndIsNewerSync", () => {
  const mockExistsSync = fsExtra.existsSync as jest.Mock;
  const mockStatSync = fsExtra.statSync as jest.Mock;

  test("returns false if the output file does not exist", () => {
    mockExistsSync.mockReturnValue(false);

    const result = fileExistsAndIsNewerSync({
      outputPath: "output.file",
      inputPath: "input.file",
    });

    expect(result).toBe(false);
    expect(mockExistsSync).toHaveBeenCalledWith("output.file");
  });

  test("returns true if output file is newer than input file", () => {
    mockExistsSync.mockReturnValue(true);
    mockStatSync.mockImplementation((path: string) => {
      return {
        mtimeMs: path === "output.file" ? 2000 : 1000,
      };
    });

    const result = fileExistsAndIsNewerSync({
      outputPath: "output.file",
      inputPath: "input.file",
    });

    expect(result).toBe(true);
    expect(mockStatSync).toHaveBeenCalledWith("output.file");
    expect(mockStatSync).toHaveBeenCalledWith("input.file");
  });

  test("returns false if output file is older than input file", () => {
    mockExistsSync.mockReturnValue(true);
    mockStatSync.mockImplementation((path: string) => {
      return {
        mtimeMs: path === "output.file" ? 1000 : 2000,
      };
    });

    const result = fileExistsAndIsNewerSync({
      outputPath: "output.file",
      inputPath: "input.file",
    });

    expect(result).toBe(false);
    expect(mockStatSync).toHaveBeenCalledWith("output.file");
    expect(mockStatSync).toHaveBeenCalledWith("input.file");
  });
});
