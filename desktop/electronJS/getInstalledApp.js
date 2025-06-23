const { exec } = require("child_process");
const path = require("path");
const { app } = require("electron");

function getInstalledApp(callback) {
  const isPackaged = app?.isPackaged;
  const psScript = isPackaged
    ? path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "electron",
        "getInstalledApps.ps1"
      )
    : path.join(__dirname, "getInstalledApps.ps1");

  exec(
    `powershell -ExecutionPolicy Bypass -File "${psScript}"`,
    { maxBuffer: 1024 * 1024 * 10 },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ PowerShell Error`, error);
        return callback([]);
      }
      if (stderr) {
        console.error("⚠️ PowerShell STDERR:", stderr);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        console.log("✅ Installed Apps:");
        callback(parsed);
      } catch (e) {
        console.error("❌ JSON parse Error:", e);
        console.log("📝 Raw output was:", stdout);
        callback([]);
      }
    }
  );
}

module.exports = getInstalledApp;
