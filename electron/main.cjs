const { BrowserWindow, app, ipcMain, dialog, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");

let win = null;
let isExamActive = false;
let isAllowQuit = false;
let end_time = null;

const cameraFeedDir = path.join(__dirname, "camera_feed");
const auditLogFile = path.join(cameraFeedDir, "audit_log.json");

function ensureAuditLog() {
  if (!fs.existsSync(cameraFeedDir)) {
    fs.mkdirSync(cameraFeedDir, { recursive: true });
  }
  if (!fs.existsSync(auditLogFile)) {
    fs.writeFileSync(auditLogFile, JSON.stringify([], null, 2));
  }
}

function appendAuditLog(entry) {
  try {
    ensureAuditLog();
    const raw = fs.readFileSync(auditLogFile, "utf-8");
    const logs = JSON.parse(raw || "[]");
    logs.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      ...entry,
    });
    fs.writeFileSync(auditLogFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

function createWindow() {
  ensureAuditLog();

  win = new BrowserWindow({
    title: "Proctra",
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    frame: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = "http://localhost:5173/";
  win.loadURL(devUrl).catch(() => {
    const distPath = path.join(__dirname, "../dist/index.html");
    if (fs.existsSync(distPath)) {
      win.loadFile(distPath);
    }
  });

  // Track fullscreen changes and notify renderer
  win.on("enter-full-screen", () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("fullscreen-changed", true);
    }
  });

  win.on("leave-full-screen", () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("fullscreen-changed", false);
      if (isExamActive) {
        appendAuditLog({
          type: "fullscreen_exit",
          message: "Student exited fullscreen during active exam.",
        });
      }
    }
  });

  // Window blur detection (application/tab switching)
  win.on("blur", () => {
    if (win && !win.isDestroyed() && isExamActive) {
      appendAuditLog({
        type: "window_blur",
        message: "Application lost focus (tab or app switch detected).",
      });
      win.webContents.send("app-blur");
    }
  });

  // Quit attempt interception
  win.on("close", (e) => {
    if (isExamActive && !isAllowQuit) {
      e.preventDefault();
      appendAuditLog({
        type: "quit_attempt",
        message: "Student attempted to quit or close the application.",
      });
      if (win && !win.isDestroyed()) {
        win.webContents.send("quit-attempt");
      }
    }
  });
}

// Fullscreen & Kiosk handlers
ipcMain.handle("set-fullscreen", (event, enable) => {
  if (!win) return false;
  try {
    if (enable) {
      win.setFullScreen(true);
      if (process.platform === "darwin") {
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      }
    } else {
      win.setKiosk(false);
      win.setFullScreen(false);
      if (process.platform === "darwin") {
        win.setVisibleOnAllWorkspaces(false);
      }
    }
    return win.isFullScreen();
  } catch (err) {
    console.error("Fullscreen error:", err);
    return false;
  }
});

ipcMain.handle("is-fullscreen", () => {
  return win ? win.isFullScreen() : false;
});

// Timer & Test lifecycle
ipcMain.handle("start-test", (event, durationMinutes = 60) => {
  isExamActive = true;
  end_time = Date.now() + durationMinutes * 60 * 1000;
  if (win) {
    win.setFullScreen(true);
    win.setKiosk(true);
    if (process.platform === "darwin") {
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
  }
  appendAuditLog({
    type: "test_started",
    message: `Exam started with duration of ${durationMinutes} minutes.`,
  });
  return { success: true, endTime: end_time };
});

ipcMain.handle("end-test", () => {
  isExamActive = false;
  if (win) {
    win.setKiosk(false);
    win.setFullScreen(false);
    if (process.platform === "darwin") {
      win.setVisibleOnAllWorkspaces(false);
    }
  }
  appendAuditLog({
    type: "test_ended",
    message: "Exam submitted and session terminated.",
  });
  return { success: true };
});

ipcMain.handle("get-time", () => {
  if (!end_time) return 0;
  return Math.max(0, end_time - Date.now());
});

// Photo & Screen capture storage
ipcMain.handle("save-photo", async (event, { image, type = "periodic_webcam" }) => {
  try {
    ensureAuditLog();
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const fileName = `snap-${type}-${Date.now()}.png`;
    const filePath = path.join(cameraFeedDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    appendAuditLog({
      type,
      message: `Snapshot captured (${type})`,
      filePath: fileName,
    });
    return { success: true, fileName };
  } catch (err) {
    console.error("Save photo error:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("capture-screen", async (event, { type = "periodic_screen" } = {}) => {
  if (!win) return { success: false };
  try {
    ensureAuditLog();
    const image = await win.webContents.capturePage();
    const fileName = `screen-${type}-${Date.now()}.png`;
    const filePath = path.join(cameraFeedDir, fileName);
    fs.writeFileSync(filePath, image.toPNG());

    appendAuditLog({
      type,
      message: `Screen screenshot captured (${type})`,
      filePath: fileName,
    });
    return { success: true, fileName };
  } catch (err) {
    console.error("Screen capture error:", err);
    return { success: false, error: err.message };
  }
});

// Invigilator Audit Logs & Review
ipcMain.handle("get-audit-logs", async () => {
  try {
    ensureAuditLog();
    const raw = fs.readFileSync(auditLogFile, "utf-8");
    const logs = JSON.parse(raw || "[]");

    // Also get list of photos with base64 thumbnail for preview
    const files = fs.readdirSync(cameraFeedDir).filter((f) => f.endsWith(".png"));
    const photos = files.slice(-20).map((file) => {
      const p = path.join(cameraFeedDir, file);
      const data = fs.readFileSync(p).toString("base64");
      return {
        fileName: file,
        dataUrl: `data:image/png;base64,${data}`,
        timestamp: fs.statSync(p).mtime,
      };
    });

    return { logs, photos };
  } catch (err) {
    return { logs: [], photos: [], error: err.message };
  }
});

ipcMain.handle("force-quit", () => {
  isExamActive = false;
  isAllowQuit = true;
  app.quit();
});

// Rules dialog fallback if needed
ipcMain.handle("show-rules", async () => {
  if (!win) return 1;
  const result = await dialog.showMessageBox(win, {
    type: "info",
    title: "Exam Rules - Proctra",
    message: "Please read and confirm the proctoring rules before starting.",
    detail:
      "1. Camera and microphone must stay active throughout the test.\n" +
      "2. Fullscreen kiosk mode is strictly enforced.\n" +
      "3. Tab or application switching is prohibited and recorded.\n" +
      "4. Unapproved quitting will be marked as Unfair Means (UFM).\n",
    buttons: ["I Agree & Start", "Cancel"],
    defaultId: 0,
    cancelId: 1,
  });
  return result.response;
});

app.whenReady().then(() => {
  nativeTheme.themeSource = "system";
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
