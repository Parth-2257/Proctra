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
    if (!cameraReady) {
      setValidationError("Camera access is required. Please grant camera permission.");
      return;
    }
    if (!micReady) {
      setValidationError("Microphone access is required. Please grant microphone permission.");
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
        <h1>System Permissions Check</h1>
        <p>Please allow the following permissions before starting the test.</p>
      </div>

      {validationError && (
        <div className="alert-banner alert-error">
          <span>{validationError}</span>
        </div>
      )}

      {cameraError && (
        <div className="alert-banner alert-warning">
          <span>Camera: {cameraError}</span>
        </div>
      )}

      {micError && (
        <div className="alert-banner alert-warning">
          <span>Microphone: {micError}</span>
        </div>
      )}

      <div className="card-container">
        {/* 1. Camera Item */}
        <div className="permission-item">
          <div className="permission-content">
            <div className="permission-title-row">
              <h3>1. Camera Access</h3>
              {cameraReady && <span className="status-badge-text">✓ Ready</span>}
            </div>
            <p>Webcam is required for photo proctoring during the test.</p>

            <div className="action-row">
              <button
                type="button"
                onClick={onGetCamera}
                className="btn btn-blue"
              >
                {cameraReady ? "✓ Camera Allowed" : "Allow Camera Access"}
              </button>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* 2. Microphone Item */}
        <div className="permission-item">
          <div className="permission-content">
            <div className="permission-title-row">
              <h3>2. Microphone Access</h3>
              {micReady && <span className="status-badge-text">✓ Ready</span>}
            </div>
            <p>Audio is monitored during the test to detect background conversations.</p>

            <div className="action-row">
              <button
                type="button"
                onClick={onGetMic}
                className="btn btn-blue"
              >
                {micReady ? "✓ Microphone Allowed" : "Allow Microphone Access"}
              </button>

              {micReady && (
                <div className="mic-meter-wrapper">
                  <span className="mic-meter-label">Audio:</span>
                  <div className="mic-level-meter">
                    <div
                      className="mic-level-bar"
                      style={{ width: `${Math.min(100, Math.max(10, audioLevel))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* 3. Fullscreen Item */}
        <div className="permission-item">
          <div className="permission-content">
            <div className="permission-title-row">
              <h3>3. Fullscreen Mode</h3>
              {fullscreenReady && <span className="status-badge-text">✓ Active</span>}
            </div>
            <p>Switch to fullscreen kiosk mode to prevent tab switching during the test.</p>

            <div className="action-row">
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="btn btn-blue"
              >
                {fullscreenReady ? "✓ Fullscreen Active" : "Enable Fullscreen Mode"}
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
          className={`btn ${allReady ? "btn-blue" : "btn-disabled"}`}
        >
          Go To Test →
        </button>
        <div className="requirements-summary">
          {!allReady ? (
            <span className="summary-pending">
              Pending: {!cameraReady && "Camera • "} {!micReady && "Microphone • "} {!fullscreenReady && "Fullscreen"}
            </span>
          ) : (
            <span className="summary-ready">✓ All permissions granted. Ready to proceed.</span>
          )}
        </div>
      </div>
    </div>
  );
}
