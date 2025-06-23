const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { startLockdown, stopLockdown } = require("./lockdown");
const psList = require("ps-list");
const getInstalledApps = require("./getInstalledApp");
const Store = require("electron-store");

const store = new Store();

let mainWindow;
let sessionActive = false;
let isFocusLocked = false;

ipcMain.on("block-close", () => {
  isFocusLocked = true;
});

ipcMain.on("unblock-close", () => {
  isFocusLocked = false;
});

ipcMain.handle("launch-app", async (event, appPath) => {
  try {
    if (!appPath || typeof appPath !== "string")
      throw new Error("Invalid path");

    const cleanPath = appPath.replace(/^"(.*)"$/, "$1");

    if (cleanPath.toLowerCase().endsWith(".exe")) {
      try {
        spawn(cleanPath, {
          detached: true,
          stdio: "ignore",
        }).unref();
      } catch (e) {
        // If spawn fails, fallback to shell.openPath
        await shell.openPath(cleanPath);
      }
    } else {
      await shell.openPath(cleanPath);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to launch app:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("get-installed-apps", async () => {
  return new Promise((resolve) => {
    getInstalledApps((apps) => {
      resolve(apps);
    });
  });
});

ipcMain.handle("get-running-apps", async () => {
  const processes = await psList();
  const names = [...new Set(processes.map((p) => p.name.toLowerCase()))]; // unique, lowercase
  return names;
});

ipcMain.handle("get-allowed-apps", () => {
  return store.get("allowedApps") || [];
});

ipcMain.handle("set-allowed-apps", (event, apps) => {
  store.set("allowedApps", apps);
});

ipcMain.on("start-focus-session", () => {
  console.log("Received start-focus-session");
  if (!sessionActive) {
    startLockdown();
    sessionActive = true;
    mainWindow.setFullScreen(true); // Add this
    // mainWindow.setAlwaysOnTop(true);
    mainWindow.webContents.send("focus-mode-status", true);
  }
});

ipcMain.on("end-focus-session", () => {
  console.log("Received end-focus-session");
  if (sessionActive) {
    stopLockdown();
    sessionActive = false;
    mainWindow.setFullScreen(false); // Add this
    // mainWindow.setAlwaysOnTop(false);
    mainWindow.webContents.send("focus-mode-status", false);
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(
    path.join(__dirname, "../Fokuspace-electron-app/dist/index.html")
  );

  mainWindow.on("close", (e) => {
    if (isFocusLocked) {
      e.preventDefault();
      mainWindow.webContents.send("show-exit-warning");
    }
  });
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
console.log("working");
