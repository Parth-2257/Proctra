export default function Header({
  screen,
  fullscreenReady,
  cameraReady,
  micReady,
  timeFormatted,
}) {
  return (
    <header className="proctra-header">
      <div className="brand-badge">
        <span className="brand-title">Proctra</span>
        <span className="brand-sub">Examination Portal</span>
      </div>

      <div className="header-center">
        {screen === "exam" && (
          <div className="timer-box">
            <span className="timer-label">Time Remaining:</span>
            <span className="timer-value">{timeFormatted || "00:00:00"}</span>
          </div>
        )}
      </div>

      <div className="header-status-group">
        <span className={`status-tag ${cameraReady ? "tag-on" : "tag-off"}`}>
          Camera: {cameraReady ? "Active" : "Off"}
        </span>
        <span className={`status-tag ${micReady ? "tag-on" : "tag-off"}`}>
          Mic: {micReady ? "Active" : "Off"}
        </span>
        <span className={`status-tag ${fullscreenReady ? "tag-on" : "tag-off"}`}>
          Fullscreen: {fullscreenReady ? "Active" : "Off"}
        </span>
      </div>
    </header>
  );
}
