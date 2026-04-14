import { exec } from "child_process";

/**
 * Runs a shell command and always resolves (never rejects).
 * ✅ Fixes:
 * - Handles npm outdated / audit exit code 1 correctly
 * - Returns ONLY valid JSON (prevents Mongo CastError)
 * - Handles stderr safely
 * - Prevents malformed output
 */
export const runCommand = (command, cwdPath, timeoutMs = 60000) => {
  return new Promise((resolve) => {
    const proc = exec(
      command,
      {
        cwd: cwdPath,
        shell: true,
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      },
      (error, stdout, stderr) => {
        // ✅ 1. Try stdout first
        if (stdout && stdout.trim()) {
          let output = stdout.trim();

          try {
            JSON.parse(output); // validate JSON
            return resolve(output); // ✅ only valid JSON allowed
          } catch {
            console.log(`[runCommand] Invalid JSON from stdout for "${command}"`);
          }
        }

        // ✅ 2. Try stderr (some tools output JSON here)
        if (stderr && stderr.trim()) {
          const s = stderr.trim();

          if (s.startsWith("{") || s.startsWith("[")) {
            try {
              JSON.parse(s);
              return resolve(s); // ✅ valid JSON from stderr
            } catch {
              console.log(`[runCommand] Invalid JSON from stderr for "${command}"`);
            }
          }
        }

        // ⚠️ Log real errors (but don't crash)
        if (error && !stdout) {
          console.log(`[runCommand] "${command}" in "${cwdPath}" — ${error.message}`);
        }

        // ❌ fallback → return empty (safe)
        resolve("");
      }
    );

    // ✅ Timeout safety
    setTimeout(() => {
      try {
        proc.kill();
      } catch {}

      console.log(`[runCommand] Timeout: "${command}"`);
      resolve("");
    }, timeoutMs + 1000);
  });
};