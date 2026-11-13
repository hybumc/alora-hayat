const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("node:path");

const iconPath = path.join(__dirname, "..", "assets", "icon.ico");
let mainWindow;

function createWindow() {
  const window = new BrowserWindow({
    title: "Alora Hayat",
    width: 1360,
    height: 900,
    minWidth: 980,
    minHeight: 700,
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f7f6f2",
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow = window;

  window.once("ready-to-show", () => window.show());
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function publishUpdateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:status", status);
  }
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on("checking-for-update", () => publishUpdateStatus({
  status: "checking",
  message: "Yeni sürüm kontrol ediliyor…",
}));
autoUpdater.on("update-available", (info) => publishUpdateStatus({
  status: "available",
  version: info.version,
  message: `Alora Hayat ${info.version} sürümü hazır. İstersen şimdi indirip kurabilirsin.`,
}));
autoUpdater.on("update-not-available", () => publishUpdateStatus({
  status: "current",
  message: "Oyunun güncel sürümünü kullanıyorsun.",
}));
autoUpdater.on("download-progress", (progress) => publishUpdateStatus({
  status: "downloading",
  percent: Math.round(progress.percent),
  message: `Güncelleme indiriliyor · %${Math.round(progress.percent)}`,
}));
autoUpdater.on("update-downloaded", (info) => publishUpdateStatus({
  status: "downloaded",
  version: info.version,
  message: `Sürüm ${info.version} indirildi. Kurmak için uygulamayı yeniden başlat.`,
}));
autoUpdater.on("error", (error) => publishUpdateStatus({
  status: "error",
  message: `Güncelleme kontrol edilemedi: ${error.message}`,
}));

ipcMain.handle("updates:check", async () => {
  if (!app.isPackaged || process.platform !== "win32") {
    throw new Error("Güncelleme denetimi yalnızca kurulu Windows uygulamasında kullanılabilir.");
  }
  await autoUpdater.checkForUpdates();
  return true;
});
ipcMain.handle("updates:download", async () => {
  if (!app.isPackaged || process.platform !== "win32") {
    throw new Error("Güncelleme yalnızca kurulu Windows uygulamasında indirilebilir.");
  }
  await autoUpdater.downloadUpdate();
  return true;
});
ipcMain.handle("updates:install", () => {
  if (!app.isPackaged || process.platform !== "win32") {
    throw new Error("Güncelleme yalnızca kurulu Windows uygulamasında yüklenebilir.");
  }
  autoUpdater.quitAndInstall();
  return true;
});

app.setAppUserModelId("tr.alora.hayat");
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
