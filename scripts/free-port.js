const { execSync } = require("child_process");

const port = Number(process.env.PORT || 5001);

function unique(arr) {
  return [...new Set(arr)];
}

function killWindowsPort(targetPort) {
  try {
    const output = execSync(`netstat -ano -p tcp | findstr :${targetPort}`, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });

    const pids = unique(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.includes("LISTENING"))
        .map((line) => line.split(/\s+/).pop())
        .map((pid) => Number(pid))
        .filter((pid) => Number.isInteger(pid) && pid > 0)
    );

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`[free-port] Killed PID ${pid} on port ${targetPort}`);
      } catch {
        // PID may already be gone; continue safely.
      }
    }
  } catch {
    // Port is likely free already.
  }
}

function killUnixPort(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort}`, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });

    const pids = unique(
      output
        .split(/\r?\n/)
        .map((v) => Number(v.trim()))
        .filter((pid) => Number.isInteger(pid) && pid > 0)
    );

    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`[free-port] Killed PID ${pid} on port ${targetPort}`);
      } catch {
        // PID may already be gone; continue safely.
      }
    }
  } catch {
    // Port is likely free already.
  }
}

if (process.platform === "win32") {
  killWindowsPort(port);
} else {
  killUnixPort(port);
}
