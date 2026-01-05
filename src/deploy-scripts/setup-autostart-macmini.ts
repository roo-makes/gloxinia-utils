import { Listr, ListrTask } from "listr2";
import { Command } from "commander";
import { NodeSSH } from "node-ssh";
import { getSshConfig } from "./utils/get-ssh-config";

const APP_NAME = "Gloxinia.app";
const APP_EXECUTABLE = "Gloxinia"; // must match Contents/MacOS/*
const APP_PATH = `/Applications/${APP_NAME}`;
const LAUNCH_AGENT_ID = "com.goddessprojections.gloxinia";
const LAUNCH_AGENT_PATH = `~/Library/LaunchAgents/${LAUNCH_AGENT_ID}.plist`;

const buildLaunchAgentPlist = () => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>${LAUNCH_AGENT_ID}</string>

    <!-- Launch Unity binary directly so launchd owns the PID -->
    <key>ProgramArguments</key>
    <array>
      <string>${APP_PATH}/Contents/MacOS/${APP_EXECUTABLE}</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <!-- IMPORTANT: Do NOT keep alive or shutdown will hang -->
    <key>KeepAlive</key>
    <false/>

    <!-- Treat as a GUI app, not a background daemon -->
    <key>ProcessType</key>
    <string>Interactive</string>

    <!-- Prevent Dock / Cmd-Tab presence -->
    <key>LSUIElement</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/tmp/gloxinia.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/gloxinia.err</string>
  </dict>
</plist>
`;

const setupAutostartScript = async () => {
  const program = new Command();
  program.option(
    "-d, --destinations <hostnames...>",
    "destination hostname(s)",
    ["goddess-macmini-a", "goddess-macmini-b"]
  );
  program.parse(process.argv);

  const { destinations } = program.opts<{ destinations: string[] }>();

  if (!destinations?.length) {
    console.error("No destination hosts provided");
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Setup kiosk autostart",
      task: () => {
        const subtasks: ListrTask[] = destinations.map((destHost) => ({
          title: destHost,
          task: async (_, task) => {
            await setupAutostartOnHost(destHost, (msg) => {
              task.output = msg;
            });
          },
        }));
        return new Listr(subtasks, { concurrent: true });
      },
    },
  ]);

  await tasks.run();
};

const setupAutostartOnHost = async (
  destHost: string,
  onStatus?: (msg: string) => void
) => {
  const ssh = new NodeSSH();
  const sshConfig = getSshConfig(destHost);

  await ssh.connect({
    host: sshConfig.Host,
    username: sshConfig.User,
    privateKeyPath: sshConfig.IdentityFile,
  });

  onStatus?.("Connected");

  onStatus?.("Verifying Unity binary exists");
  const exists = await ssh.exec(
    `test -x "${APP_PATH}/Contents/MacOS/${APP_EXECUTABLE}" && echo ok || echo missing`,
    []
  );

  if (!exists.includes("ok")) {
    throw new Error(`App binary not found at ${APP_PATH}`);
  }

  onStatus?.("Writing LaunchAgent plist");
  const plistContent = buildLaunchAgentPlist();

  await ssh.exec(
    `mkdir -p ~/Library/LaunchAgents && cat > ${LAUNCH_AGENT_PATH}`,
    [],
    { stdin: plistContent }
  );

  onStatus?.("Unloading previous LaunchAgent (if any)");
  await ssh.exec(
    `launchctl unload ${LAUNCH_AGENT_PATH} 2>/dev/null || true`,
    []
  );

  onStatus?.("Loading LaunchAgent");
  await ssh.exec(`launchctl load ${LAUNCH_AGENT_PATH}`, []);

  onStatus?.("Autostart configured safely");

  await ssh.dispose();
};

setupAutostartScript();
