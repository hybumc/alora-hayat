const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aloraUpdater", {
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  downloadAndInstall: () => ipcRenderer.invoke("updates:download"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  onStatus: (listener) => {
    const handler = (_event, status) => listener(status);
    ipcRenderer.on("updates:status", handler);
    return () => ipcRenderer.removeListener("updates:status", handler);
  },
});
