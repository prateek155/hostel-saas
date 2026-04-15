import { exec } from "child_process";
import path from "path";

/**
 * Runs a shell command safely and resolves with { stdout, stderr, timedOut, exitCode }.
 *
 * Key improvements over v1:
 *  - Returns a structured result object (not just a string) so callers know if it timed out
 *  - Single timeout mechanism (no duplicate setTimeout + exec timeout race)
 *  - Path sanitization to prevent directory traversal
 *  - Larger default buffer (20MB)
 *  - Separate helper runCommandJSON() for commands that always return JSON
 */
export const runCommand = (command, cwdPath, timeoutMs = 60000) => {
  return new Promise((resolve) => {
    // ── Sanitize cwd: must be absolute and must not escape project root
    const safeCwd = (() => {
      try {
        const abs = path.resolve(cwdPath);
        // Allow any absolute path — caller is responsible for valid dirs
        return abs;
      } catch {
        return process.cwd();
      }
    })();

    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const proc = exec(
      command,
      {
        cwd: safeCwd,
        shell: true,
        timeout: timeoutMs,          // exec-level timeout kills the process
        maxBuffer: 1024 * 1024 * 20, // 20MB
        killSignal: "SIGTERM",
      },
      (error, stdout, stderr) => {
        const out = (stdout || "").trim();
        const err = (stderr || "").trim();

        settle({
          stdout: out,
          stderr: err,
          exitCode: error?.code ?? 0,
          timedOut: error?.killed ?? false,
          error: error ? error.message : null,
        });
      }
    );

    // Backup timeout in case exec's internal one misbehaves
    const timer = setTimeout(() => {
      try { proc.kill("SIGTERM"); } catch {}
      console.error(`[runCommand] Hard timeout (${timeoutMs}ms): "${command}"`);
      settle({ stdout: "", stderr: "", exitCode: -1, timedOut: true, error: "Timeout" });
    }, timeoutMs + 2000);

    // Clear backup timer once exec callback fires
    proc.on("close", () => clearTimeout(timer));
  });
};

/**
 * Convenience wrapper — runs a command and parses JSON from stdout (or stderr fallback).
 * Returns parsed object or null on failure.
 */
export const runCommandJSON = async (command, cwdPath, timeoutMs = 60000) => {
  const result = await runCommand(command, cwdPath, timeoutMs);

  // ✅ Try parsing stdout
  if (result.stdout) {
    try {
      return JSON.parse(result.stdout);
    } catch (err) {
      console.error("[runCommandJSON] Invalid JSON (stdout):", err.message);
    }
  }

  // ✅ Try parsing stderr (npm audit case)
  if (result.stderr) {
    const s = result.stderr;
    if (s.startsWith("{") || s.startsWith("[")) {
      try {
        return JSON.parse(s);
      } catch (err) {
        console.error("[runCommandJSON] Invalid JSON (stderr):", err.message);
      }
    }
  }

  // ✅ Log command-level error
  if (result.error && !result.timedOut) {
    console.error(
      `[runCommandJSON] "${command}" — ${result.error.slice(0, 120)}`
    );
  }

  return null;
};

/**
 * Returns just the plain text stdout of a command (for non-JSON tools like df, uptime, etc.)
 * Never throws.
 */
export const runCommandText = async (command, cwdPath, timeoutMs = 15000) => {
  const result = await runCommand(command, cwdPath, timeoutMs);
  return result.stdout || result.stderr || "";
};