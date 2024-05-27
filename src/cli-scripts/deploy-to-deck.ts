import { createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import Rsync from "rsync";
import decompress from "decompress";
import tmp from "tmp-promise";
import { Listr } from "listr2";

type StatusFunction = (msg: string) => void;

const LINUX_BUILD_URL =
  "https://d1gmijsvnicp5r.cloudfront.net/roo-makes/gloxinia-v4/branch/master/unitybuild-StandaloneLinux64.zip";
const HOST_ALIAS = "steamdeck";
const DECK_OUTPUT_DIR = "/home/deck/Desktop/Gloxinia";

tmp.setGracefulCleanup();

// Download the build from cloudfront to a temporary folder
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
};

const getTempDir = async (): Promise<tmp.DirectoryResult> => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
  console.log("Temp Dir: ", tmpDir.path);
  return tmpDir;
};

const unzipBuild = async (zipPath: string): Promise<string> => {
  const outDir = await getTempDir();
  const res = await decompress(zipPath, outDir.path);
  return outDir.path;
};

const copyBuildToDeck = async (
  buildDir: string,
  onStatus?: StatusFunction
): Promise<void> => {
  const rsync = new Rsync()
    .shell("ssh")
    .flags("avz")
    .set("progress")
    .set("timeout", "5")
    .source(buildDir + "/")
    .destination(`${HOST_ALIAS}:${DECK_OUTPUT_DIR}`);

  return new Promise((res, rej) => {
    rsync.execute(
      (error, code, cmd) => {
        if (error) {
          if (code == 30) {
            rej(`Steam Deck not online`);
          } else {
            rej(`Error deploying to Steam Deck: ${error}`);
          }
        } else {
          res();
        }
      },
      (data) => {
        onStatus?.(data.toString());
      }
    );
  });
};

const tasks = new Listr([
  {
    title: "Download Linux build",
    task: async (ctx, task) => {
      const downloadDir = await getTempDir();
      const downloadZipPath = `${downloadDir.path}/build.zip`;
      await downloadBuild(
        LINUX_BUILD_URL,
        downloadZipPath,
        (msg: string) => (task.output = msg)
      );
      ctx.zipPath = downloadZipPath;
    },
  },
  {
    title: "Unzip build",
    task: async (ctx) => {
      ctx.buildDir = await unzipBuild(ctx.zipPath);
    },
  },
  {
    title: "Copy build to Steam Deck",
    task: async (ctx, task) => {
      await copyBuildToDeck(ctx.buildDir, (msg: string) => (task.output = msg));
    },
  },
]);

const deployToDeck = async () => {
  await tasks.run();
  console.log("Deployed to Steam Deck");
};

deployToDeck();
