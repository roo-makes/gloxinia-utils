import { existsSync, statSync } from "fs";
import Rsync from "rsync";
import { Listr, ListrTask } from "listr2";
import { Command } from "commander";
import { downloadToTempDir } from "./parts-deploy/download-to-temp-dir";
import { StatusFunction } from "./types/common-deploy";
import { zipFolder } from "./parts-deploy/zip-unzip";
import { NodeSSH } from "node-ssh";
import prompts from "prompts";
import { getSshConfig } from "./utils/get-ssh-config";
import path from "path";

const MAC_BUILD_URL =
  "https://d1gmijsvnicp5r.cloudfront.net/roo-makes/gloxinia-v4/branch/master/unitybuild-StandaloneOSX.zip";
const EDITOR_BUILD_PATH =
  "/Users/andrew/dev/unity/gloxinia-v4/Builds/Gloxinia.app";
const APP_NAME = "Gloxinia.app";
const REMOTE_INSTALL_DIR = "/Applications";
const REMOTE_TMP_DIR = "/tmp/gloxinia-deploy";
const DOWNLOADS_FOLDER = "/Users/andrew/Downloads";
const DOWNLOADED_FILENAME = "Unity Build Standalone OSX.zip";

const VALID_BUILD_EXTENSIONS = [".app", ".zip"];

const obtainBuildPath = async (buildPath?: string) => {
  if (
    buildPath &&
    !VALID_BUILD_EXTENSIONS.some((ext) => buildPath.endsWith(ext)) &&
    existsSync(buildPath)
  ) {
    console.error(`Invalid build path: ${buildPath}`);
    process.exit(1);
  }

  if (buildPath && buildPath.endsWith(".app")) {
    return await zipFolder(buildPath);
  }

  if (buildPath && buildPath.endsWith(".zip")) {
    return buildPath;
  }

  console.log("Getting response");

  const response = await prompts(
    [
      {
        type: "select",
        name: "buildSource",
        message: "Where to get build?",
        choices: [
          { title: "Cloudfront", value: "cloudfront" },
          { title: "Last Editor Build", value: "editor-build" },
          { title: "Downloads Folder", value: "downloads-folder" },
        ],
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        console.log("Build source selection cancelled by user");
        process.exit(0);
      },
    }
  );

  if (response.buildSource === "cloudfront") {
    return await downloadToTempDir(MAC_BUILD_URL);
  } else {
    if (response.buildSource === "downloads-folder") {
      return path.join(DOWNLOADS_FOLDER, DOWNLOADED_FILENAME);
    }
    if (EDITOR_BUILD_PATH.endsWith(".app")) {
      console.log("Zipping editor build...");
      return await zipFolder(EDITOR_BUILD_PATH);
    } else {
      console.log("Using editor build path...");
      return EDITOR_BUILD_PATH;
    }
  }
};

const deployToMacminiScript = async () => {
  const program = new Command();
  program.option(
    "-d, --destinations <hostnames...>",
    "destination hostname",
    "goddess-macmini-1-direct"
  );
  program.option("--buildPath <buildPath>", "build path to deploy");
  program.parse(process.argv);
  const options = program.opts();
  const destinations = options.destinations as string[];

  console.log(options);
  if (!Array.isArray(destinations) || !destinations.length) {
    console.error("No destination hosts provided");
    process.exit(1);
  }

  const buildPath = await obtainBuildPath(options.buildPath);

  const tasks = new Listr([
    {
      title: "Copy build to destination hosts",
      task: (ctx, task) => {
        const tasks: ListrTask[] = [];
        for (const destHost of destinations) {
          tasks.push({
            title: destHost,
            task: async (ctx, task) => {
              await copyBuildToMacmini(
                destHost,
                buildPath,
                (msg: string) => (task.output = msg)
              );
            },
          });
        }
        return new Listr(tasks, { concurrent: true });
      },
    },
  ]);

  await tasks.run();
};

const copyBuildToMacmini = async (
  destHost: string,
  localZipPath: string,
  onStatus?: StatusFunction
): Promise<void> => {
  const ssh = new NodeSSH();
  const sshConfig = getSshConfig(destHost);

  console.log("SSH Config", sshConfig);

  const connection = await ssh.connect({
    host: sshConfig.Host,
    username: sshConfig.User,
    privateKeyPath: sshConfig.IdentityFile,
  });

  if (!connection.isConnected()) {
    throw new Error(`Failed to connect to destination host ${destHost}`);
  }
  console.log("Connected to destination host", destHost);

  // Clean up old build and zip
  onStatus?.("Cleaning up old build and zip");
  await connection.exec(`rm -rf ${REMOTE_TMP_DIR}`, []);
  await connection.exec(`mkdir -p ${REMOTE_TMP_DIR}`, []);

  const rsync = new Rsync()
    .shell("ssh")
    .flags("avz")
    .set("progress")
    .set("timeout", "5")
    .source(localZipPath)
    .destination(`${destHost}:${REMOTE_TMP_DIR}/build.zip`);

  // Copy zip to dest host
  await new Promise<void>((res, rej) => {
    onStatus?.("Copying build to destination host");
    rsync.execute(
      (error, code, cmd) => {
        if (error) {
          if (code == 30) {
            onStatus?.("Destination host not online");
            rej(new Error(`Destination host not online`));
          } else {
            onStatus?.(`Error deploying to destination host: ${error}`);
            rej(`Error deploying to destination host: ${error}`);
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

  // Unzip zip on dest host
  onStatus?.("Unzipping build on destination host");
  await connection.exec(
    `unzip ${REMOTE_TMP_DIR}/build.zip -d ${REMOTE_TMP_DIR}/build`,
    []
  );

  // Handle existing build - quit if running, then remove
  onStatus?.("Checking for existing build");
  const existingAppPath = `${REMOTE_INSTALL_DIR}/${APP_NAME}`;
  const checkResult = await connection.exec(
    `test -d "${existingAppPath}" && echo "exists" || echo "not_exists"`,
    []
  );

  if (checkResult.includes("exists")) {
    onStatus?.("Existing build found, quitting if running");
    // Try to quit the app gracefully, ignore errors if not running
    await connection.exec(
      `killall -TERM "${APP_NAME}" 2>/dev/null || true`,
      []
    );
    // Wait a moment for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Force kill if still running
    await connection.exec(
      `killall -KILL "${APP_NAME}" 2>/dev/null || true`,
      []
    );

    onStatus?.("Removing old build");
    await connection.exec(`rm -rf "${existingAppPath}"`, []);
  }

  onStatus?.("Moving build to installation directory");
  await connection.exec(
    `mv ${REMOTE_TMP_DIR}/build/${APP_NAME} ${REMOTE_INSTALL_DIR}/${APP_NAME}`,
    []
  );
  onStatus?.("Removing quarantine from build");
  await connection.exec(
    `xattr -dr com.apple.quarantine "${REMOTE_INSTALL_DIR}/${APP_NAME}"`,
    []
  );
  onStatus?.("Verifying build");
  await connection.exec(
    `codesign --verify --deep --strict "${REMOTE_INSTALL_DIR}/${APP_NAME}" || true`,
    []
  );
  onStatus?.("Cleaning up temporary files");
  await connection.exec(
    `rm -rf ${REMOTE_TMP_DIR}/build ${REMOTE_TMP_DIR}/build.zip`,
    []
  );
  onStatus?.("Build deployed successfully");

  await ssh.dispose();
  console.log("Disconnected from destination host", destHost);
};

deployToMacminiScript();
// Done