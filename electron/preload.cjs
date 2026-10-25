const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Fullscreen
  setFullScreen: (enable = true) => ipcRenderer.invoke("set-fullscreen", enable),
  isFullScreen: () => ipcRenderer.invoke("is-fullscreen"),

  // Test session lifecycle
  startTest: (durationMinutes = 60) => ipcRenderer.invoke("start-test", durationMinutes),
  endTest: () => ipcRenderer.invoke("end-test"),
  getRemainingTime: () => ipcRenderer.invoke("get-time"),
  showRules: () => ipcRenderer.invoke("show-rules"),

  // Monitoring and captures
  savePhoto: (image, type = "periodic_webcam") =>
    ipcRenderer.invoke("save-photo", { image, type }),
  captureScreen: (type = "periodic_screen") =>
    ipcRenderer.invoke("capture-screen", { type }),
  getAuditLogs: () => ipcRenderer.invoke("get-audit-logs"),
  forceQuit: () => ipcRenderer.invoke("force-quit"),

  // Event listeners
  onFullScreenChange: (callback) => {
    const handler = (event, isFs) => callback(isFs);
    ipcRenderer.on("fullscreen-changed", handler);
    return () => ipcRenderer.removeListener("fullscreen-changed", handler);
  },
  onWindowBlur: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("app-blur", handler);
    return () => ipcRenderer.removeListener("app-blur", handler);
  },
  onQuitAttempt: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("quit-attempt", handler);
    return () => ipcRenderer.removeListener("quit-attempt", handler);
  },
});
