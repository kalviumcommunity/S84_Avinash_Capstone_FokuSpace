// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  getAllowedApps: () => ipcRenderer.invoke("get-allowed-apps"),
  setAllowedApps: (apps) => ipcRenderer.invoke("set-allowed-apps", apps),
  getInstalledApps: () => ipcRenderer.invoke("get-installed-apps"),
  getRunningApps: () => ipcRenderer.invoke("get-running-apps"),
  launchApp: (appPath) => ipcRenderer.invoke("launch-app", appPath),
  blockClose: () => ipcRenderer.send("block-close"),
  unblockClose: () => ipcRenderer.send("unblock-close"),
});
