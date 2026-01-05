import { Listr, ListrTask } from "listr2";
import { Command } from "commander";
import { StatusFunction } from "./types/common";
import { NodeSSH } from "node-ssh";
import { getSshConfig } from "./utils/get-ssh-config";

const APP_NAME = "Gloxinia.app";
const REMOTE_INSTALL_DIR = "/Applications";

const restartAppMacminiScript = async () => {
  const program = new Command();
  program.option(
    "-d, --destinations <hostnames...>",
    "destination hostname",
    "goddess-macmini-1-direct"
  );
  program.parse(process.argv);
  const options = program.opts();
  const destinations = options.destinations as string[];

  if (!Array.isArray(destinations) || !destinations.length) {
    console.error("No destination hosts provided");
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Restart app on destination hosts",
      task: (ctx, task) => {
        const tasks: ListrTask[] = [];
        for (const destHost of destinations) {
          tasks.push({
            title: destHost,
            task: async (ctx, task) => {
              await restartAppMacmini(
                destHost,
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

const checkIfAppRunning = async (
  connection: NodeSSH,
  processName: string
): Promise<boolean> => {
  const checkResult = await connection.exec(
    `pgrep "${processName}" > /dev/null 2>&1 && echo "1" || echo "0"`,
    []
  );
  return parseInt(checkResult) === 1;
};

const restartAppMacmini = async (
  destHost: string,
  onStatus?: StatusFunction
): Promise<void> => {
  const ssh = new NodeSSH();
  const sshConfig = getSshConfig(destHost);

  const connection = await ssh.connect({
    host: sshConfig.Host,
    username: sshConfig.User,
    privateKeyPath: sshConfig.IdentityFile,
  });

  if (!connection.isConnected()) {
    throw new Error(`Failed to connect to destination host ${destHost}`);
  }
  onStatus?.(`Connected to ${destHost}`);

  // Handle existing build - quit if running, then remove
  onStatus?.("Checking for existing build");
  const existingAppPath = `${REMOTE_INSTALL_DIR}/${APP_NAME}`;
  const checkResult = await connection.exec(
    `test -d "${existingAppPath}" && echo "exists" || echo "not_exists"`,
    []
  );

  const exists = checkResult.includes("exists");
  if (!exists) {
    onStatus?.("No build found, nothing to do");
    await ssh.dispose();
    return;
  }

  onStatus?.("Existing build found, quitting if running");
  // Extract process name from app bundle name (remove .app extension)
  const processName = APP_NAME.replace(/\.app$/, "");

  const isRunning = await checkIfAppRunning(connection, processName);
  if (isRunning) {
    // Try to quit the app gracefully using osascript (macOS native way)
    await connection.exec(
      `osascript -e 'tell application "${processName}" to quit' 2>/dev/null || true`,
      []
    );
    // Wait a moment for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // If still running, try killall with process name
    await connection.exec(`killall "${processName}" 2>/dev/null || true`, []);
    // Wait a bit more
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Force kill if still running
    await connection.exec(
      `killall -9 "${processName}" 2>/dev/null || true`,
      []
    );
    onStatus?.("App quit, waiting a second to ensure it is fully quit");

    // Wait for a second to ensure the app is fully quit
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } else {
    onStatus?.("App is not currently running.");
  }

  onStatus?.("Starting app");
  await connection.exec(`open "${REMOTE_INSTALL_DIR}/${APP_NAME}"`, []);

  let isNewAppRunning = false;
  for (let i = 0; i < 5; i++) {
    isNewAppRunning = await checkIfAppRunning(connection, processName);
    if (isNewAppRunning) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a second
  }
  if (!isNewAppRunning) {
    onStatus?.("New app did not start");
    await ssh.dispose();
    process.exit(1);
  } else {
    onStatus?.("App restarted successfully");
    await ssh.dispose();
  }
};

restartAppMacminiScript();
