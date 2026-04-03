import { exec } from "child_process";

export const runCommand = (command, cwdPath) => {
  return new Promise((resolve) => {
    exec(
      command,
      {
        cwd: cwdPath,
        shell: true, // ✅ AUTO DETECT SHELL (BEST FIX)
      },
      (error, stdout, stderr) => {
        if (stdout) return resolve(stdout);
        if (stderr) return resolve(stderr);

        console.log("Command error:", error?.message);
        resolve("");
      }
    );
  });
};