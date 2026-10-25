export default function Header({
  screen,
  fullscreenReady,
  cameraReady,
  micReady,
  timeFormatted,
  onOpenInvigilator,
}) {
  return (
    <header className="invigilo-header">
      <div className="brand-badge">
        <div className="brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">INVIGILO</span>
          <span className="brand-sub">Secure Proctoring Engine</span>
        </div>
      </div>

      <div className="header-center">
        {screen === "exam" && (
          <div className="timer-pill">
            <span className="timer-icon">⏱</span>
            <span className="timer-label">Time Remaining:</span>
            <span className="timer-value">{timeFormatted || "00:00:00"}</span>
          </div>
        )}
      </div>

      <div className="header-status-group">
        <div className="system-indicators">
          <span
            className={`indicator-pill ${cameraReady ? "pill-active" : "pill-inactive"}`}
            title={cameraReady ? "Camera connected" : "Camera disconnected"}
          >
            <span className="dot"></span> CAM
          </span>
          <span
            className={`indicator-pill ${micReady ? "pill-active" : "pill-inactive"}`}
            title={micReady ? "Microphone active" : "Microphone inactive"}
          >
            <span className="dot"></span> MIC
          </span>
          <span
            className={`indicator-pill ${fullscreenReady ? "pill-active" : "pill-inactive"}`}
            title={fullscreenReady ? "Fullscreen locked" : "Fullscreen inactive"}
          >
            <span className="dot"></span> KIOSK
          </span>
        </div>

        <button
          className="btn-invigilator-link"
          onClick={onOpenInvigilator}
          title="Invigilator Audit Dashboard"
        >
          🛡️ Invigilator
        </button>
      </div>
    </header>
  );
}
