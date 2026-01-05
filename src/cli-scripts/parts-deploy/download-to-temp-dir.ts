import { createWriteStream } from "fs-extra";
import { Listr, ListrTask } from "listr2";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

import tmp from "tmp-promise";
tmp.setGracefulCleanup();

type StatusFunction = (msg: string) => void;

const getTempDir = async (): Promise<tmp.DirectoryResult> => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
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

  const listrTask: ListrTask = {
    title: "Downloading build",
    task: async (ctx, task) => {
      const downloadSize = buildRes.headers.get("Content-Length");
      task.output = `Download size: ${downloadSize} bytes`;
      let receivedLength = 0;
      reader.on("data", (chunk) => {
        receivedLength += chunk.length;
        const percent = (
          (receivedLength / parseInt(downloadSize!)) *
          100
        ).toFixed(1);
        task.output = `${percent}% downloaded`;
        writer.write(chunk);
      });

      await finished(reader);
      writer.end();
      task.output = "Download completed";
    },
  };

  await new Listr([listrTask]).run({ output: onStatus });
};

// Download the build from a url to a temporary directory
// Returns the path to the downloaded file
export const downloadToTempDir = async (
  url: string,
  onStatus?: StatusFunction
): Promise<string> => {
  const tempDir = await getTempDir();
  const downloadPath = path.join(tempDir.path, "build.zip");
  onStatus?.(`Downloading build to: ${downloadPath}`);
  await downloadBuild(url, downloadPath, onStatus);
  return downloadPath;
};
