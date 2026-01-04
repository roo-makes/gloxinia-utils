import path from "path";
import os from "os";
import fs from "fs";
import SSHConfig from "ssh-config";

const sshConfig = SSHConfig.parse(
  fs.readFileSync(path.join(os.homedir(), ".ssh", "config"), {
    encoding: "utf8",
  })
);

export const getSshConfig = (hostName: string) => {
  let host = sshConfig.compute(hostName);
  if (!host) {
    throw new Error(`Host ${hostName} not found in SSH config`);
  }
  let identityFile = Array.isArray(host.IdentityFile)
    ? host.IdentityFile[0]
    : host.IdentityFile;

  // Resolve ~ to home directory properly
  if (identityFile && identityFile.startsWith("~")) {
    identityFile = path.join(os.homedir(), identityFile.slice(1));
  }

  // Resolve to absolute path
  if (identityFile && !path.isAbsolute(identityFile)) {
    identityFile = path.resolve(identityFile);
  }

  return {
    Host: host.HostName,
    User: host.User,
    IdentityFile: identityFile,
  };
};
