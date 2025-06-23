const { exec } = require("child_process");
const path = require("path");
const { app } = require("electron");

function getInstalledApps(callback) {
  const isPackaged = app?.isPackaged;
  const psScript = isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", "electronJS", "getInstalledApps.ps1")
    : path.join(__dirname, "getInstalledApps.ps1");
  console.log("Script Path:", psScript);

  exec(
    `powershell -ExecutionPolicy Bypass -File "${psScript}"`,
    { maxBuffer: 1024 * 1024 * 50 }, // Increased to 50MB
    (error, stdout, stderr) => {
      console.log("Script Path:", psScript);
      if (error) {
        console.error(`❌ PowerShell Error: ${error.message}`);
        return callback([]);
      }
      console.log("Raw stdout:", stdout);
      console.log("Raw stderr:", stderr);
      try {
        const parsed = JSON.parse(stdout.trim());
        console.log("✅ Parsed Apps:", parsed.length, parsed.slice(0, 5), "...");
        callback(parsed);
      } catch (e) {
        console.error("❌ JSON parse Error:", e.message);
        console.log("📝 Raw output was:", stdout);
        callback([]);
      }
    }
  );
}

module.exports = getInstalledApps;