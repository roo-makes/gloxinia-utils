import { createWriteStream } from "fs-extra";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

import tmp from "tmp-promise";
tmp.setGracefulCleanup();

type StatusFunction = (msg: string) => void;

const getTempDir = async (): Promise<tmp.DirectoryResult> => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
  console.log("Temp Dir: ", tmpDir.path);
  return tmpDir;
};

const downloadBuild = async (
  url: string,
  outputPath: string,
  onStatus?: StatusFunction
): Promise<void> => {
  onStatus?.("Starting download...");
  const buildRes = await fetch(url);
  if (!buildRes.ok || !buildRes.body) {
    throw new Error("Failed to download build");
  }

  const writer = createWriteStream(outputPath, { flags: "w" });

  const reader = Readable.fromWeb(buildRes.body);

  if (onStatus) {
    // Const get the progress
    const downloadSize = buildRes.headers.get("Content-Length");
    onStatus(`Download size: ${downloadSize} bytes`);
    let receivedLength = 0;
    reader.on("data", (chunk) => {
      receivedLength += chunk.length;
      const percent = (
        (receivedLength / parseInt(downloadSize!)) *
        100
      ).toFixed(1);
      onStatus(`${percent}% downloaded`);
      writer.write(chunk);
    });
  }

  await finished(reader);
  writer.end();
};

// Download the build from a url to a temporary directory
// Returns the path to the downloaded file
export const downloadToTempDir = async (
  url: string,
  onStatus?: StatusFunction
): Promise<string> => {
  const tempDir = await getTempDir();
  const downloadPath = path.join(tempDir.path, "build.zip");
  await downloadBuild(url, downloadPath, onStatus);
  return downloadPath;
};
