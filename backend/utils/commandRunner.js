import { exec } from "child_process";

/**
 * Runs a shell command and always resolves (never rejects).
 * Key fix: npm outdated exits with code 1 when packages ARE outdated —
 * that is not an error. We capture stdout regardless of exit code.
 */
export const runCommand = (command, cwdPath, timeoutMs = 30000) => {
  return new Promise((resolve) => {
    const proc = exec(
      command,
      {
        cwd: cwdPath,
        shell: true,
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 10, // 10 MB — audit output can be large
      },
      (error, stdout, stderr) => {
        // Always prefer stdout — even when exit code != 0.
        // npm outdated / npm audit return exit code 1 on findings, but the
        // JSON data we need is still in stdout.
        if (stdout && stdout.trim()) return resolve(stdout.trim());

        // Some tools write to stderr on success (e.g. eslint with --format json
        // writes to stdout, but other tools differ)
        if (stderr && stderr.trim()) {
          // Only resolve with stderr if it looks like JSON or useful data,
          // not a generic error message
          const s = stderr.trim();
          if (s.startsWith("{") || s.startsWith("[")) return resolve(s);
        }

        // Log actual command failures for debugging
        if (error && !stdout) {
          console.log(`[runCommand] "${command}" in "${cwdPath}" — ${error.message}`);
        }

        resolve("");
      }
    );

    // Safety: kill the process if it hangs
    setTimeout(() => {
      try { proc.kill(); } catch {}
      console.log(`[runCommand] Timeout: "${command}"`);
      resolve("");
    }, timeoutMs + 1000);
  });
};