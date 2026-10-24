const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
} = require("electron");
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

ipcMain.handle("get-time", () => {
  return end_time - Date.now();
});

ipcMain.handle("showexam-rules", async () => {
  const res = await dialog.showMessageBox(win, {
    type: "info",
    buttons: ["Accept", "Cancel"],
    title: "Exam Rules",
    message: "Please follow the exam rules.",
  });
  console.log(res); // 0 for Accept, 1 for Cancel
});

app.whenReady().then(() => {
  createWindow();
});
