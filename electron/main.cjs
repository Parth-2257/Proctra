const { BrowserWindow, app, ipcMain } = require("electron");
const path = require("path");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.loadURL("http://localhost:5173/");
  win.webContents.openDevTools({ mode: "detach" });
}

ipcMain.handle("full-screen", () => {
  win.kiosk = true;
});

let end_time = null;

ipcMain.handle("start-test", () => {
  end_time = Date.now() + 60 * 60 * 60;
});

app.whenReady().then(() => {
  createWindow();
});
