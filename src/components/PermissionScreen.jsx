import { useState } from "react";

export default function PermissionScreen({
  cameraReady,
  micReady,
  fullscreenReady,
  onGetCamera,
  onGetMic,
  onToggleFullscreen,
  onProceedToInstructions,
  cameraError,
  micError,
  audioLevel,
}) {
  const [validationError, setValidationError] = useState("");

  const allReady = cameraReady && micReady && fullscreenReady;

  const handleGoToTest = () => {
    // Strict validation
    if (!cameraReady) {
      setValidationError("Camera access is required. Please click 'Get Camera Access'.");
      return;
    }
    if (!micReady) {
      setValidationError("Microphone access is required. Please click 'Get Microphone Access'.");
      return;
    }
    if (!fullscreenReady) {
      setValidationError("Fullscreen mode must be enabled to proceed with the exam.");
      return;
    }

    setValidationError("");
    onProceedToInstructions();
  };

  return (
    <div className="page-container">
      <div className="header-section">
        <div className="badge-tag">INVIGILO SYSTEM VERIFICATION</div>
        <h1>Candidate Pre-Check & Environment Verification</h1>
        <p>Please grant hardware permissions and enable fullscreen kiosk to continue.</p>
      </div>

      {validationError && (
        <div className="alert-banner alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {cameraError && (
        <div className="alert-banner alert-warning">
          <span className="alert-icon">📷</span>
          <span>Camera Error: {cameraError}</span>
        </div>
      )}

      {micError && (
        <div className="alert-banner alert-warning">
          <span className="alert-icon">🎙️</span>
          <span>Microphone Error: {micError}</span>
        </div>
      )}

      <div className="card-container">
        {/* 1. Camera Item */}
        <div className="permission-item">
          <div className="permission-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>

          <div className="permission-content">
            <div className="permission-header-line">
              <h3>Configure Web Camera</h3>
              {cameraReady && <span className="status-badge badge-green">✓ Ready</span>}
            </div>
            <p>A continuous video feed is required for biometric proctoring and identity verification.</p>

            <div className="action-row">
              <button
                type="button"
                onClick={onGetCamera}
                className={`btn ${cameraReady ? "btn-success" : "btn-dark"}`}
              >
                {cameraReady ? "✓ Camera Access Granted" : "Get Camera Access"}
              </button>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* 2. Microphone Item */}
        <div className="permission-item">
          <div className="permission-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>

          <div className="permission-content">
            <div className="permission-header-line">
              <h3>Configure Audio Microphone</h3>
              {micReady && <span className="status-badge badge-green">✓ Ready</span>}
            </div>
            <p>Audio is analyzed in real-time to detect secondary speakers or ambient communication.</p>

            <div className="action-row">
              <button
                type="button"
                onClick={onGetMic}
                className={`btn ${micReady ? "btn-success" : "btn-dark"}`}
              >
                {micReady ? "✓ Microphone Access Granted" : "Get Microphone Access"}
              </button>

              {micReady && (
                <div className="mic-level-meter" title="Mic Audio Activity">
                  <div
                    className="mic-level-bar"
                    style={{ width: `${Math.min(100, Math.max(10, audioLevel))}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* 3. Fullscreen Item */}
        <div className="permission-item">
          <div className="permission-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </div>

          <div className="permission-content">
            <div className="permission-header-line">
              <h3>Switch to Fullscreen Kiosk Mode</h3>
              {fullscreenReady && <span className="status-badge badge-green">✓ Active</span>}
            </div>
            <p>Close all background applications. Fullscreen mode prevents unauthorized multitasking during the test.</p>

            <div className="action-row">
              <button
                type="button"
                onClick={onToggleFullscreen}
                className={`btn ${fullscreenReady ? "btn-success" : "btn-light-blue"}`}
              >
                {fullscreenReady ? "✓ Fullscreen Enabled" : "Give Full Screen Permissions"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button
          type="button"
          onClick={handleGoToTest}
          disabled={!allReady}
          className={`btn ${allReady ? "btn-primary-active" : "btn-disabled"}`}
        >
          Go To Test →
        </button>
        <div className="requirements-summary">
          {!allReady ? (
            <span className="summary-pending">
              Pending: {!cameraReady && "Camera • "} {!micReady && "Microphone • "} {!fullscreenReady && "Fullscreen"}
            </span>
          ) : (
            <span className="summary-ready">✓ All hardware & environment checks passed!</span>
          )}
        </div>
      </div>
    </div>
  );
}
