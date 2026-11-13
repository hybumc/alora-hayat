const { app, BrowserWindow } = require("electron");
const path = require("node:path");

const iconPath = path.join(__dirname, "..", "assets", "icon.ico");

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
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

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
