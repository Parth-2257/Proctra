import { useState } from "react";

export default function WarningModal({
  type, // "blur" | "quit" | "submit" | "resume"
  violationsCount,
  onSubmitConfirm,
  onResumeConfirm,
  onResumeDiscard,
  onDismiss,
  onInvigilatorQuit,
  totalQuestions,
  answeredCount,
  markedCount,
}) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleVerifyPinAndQuit = () => {
    if (pin.trim() === "invigilo2026" || pin.trim() === "admin123" || pin.trim() === "1234") {
      onInvigilatorQuit();
    } else {
      setPinError("Invalid Invigilator PIN. Please contact proctor.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* BLUR / TAB SWITCH WARNING */}
        {type === "blur" && (
          <div className="warning-content blur-warning">
            <div className="modal-icon-badge icon-red">⚠️</div>
            <h2>PROCTORING VIOLATION: APPLICATION FOCUS LOST</h2>
            <p className="warning-strike-text">
              Strike <strong>{violationsCount} of 3</strong>
            </p>
            <p className="modal-desc">
              You navigated away from the exam window or switched applications. This incident has been
              recorded with a timestamp and flagged in the invigilation audit log.
            </p>
            <div className="modal-notice-box">
              {violationsCount >= 3 ? (
                <span className="notice-critical">
                  🚨 Maximum strikes reached! Your exam session is currently flagged for Unfair Means (UFM) review.
                </span>
              ) : (
                <span>
                  Please return your full attention to the exam. Reaching 3 strikes results in immediate disciplinary review.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="btn btn-primary btn-modal-action"
            >
              I Understand & Return to Exam
            </button>
          </div>
        )}

        {/* QUIT ATTEMPT WARNING */}
        {type === "quit" && (
          <div className="warning-content quit-warning">
            <div className="modal-icon-badge icon-red">🛑</div>
            <h2>UNAUTHORIZED APPLICATION EXIT DETECTED</h2>
            <p className="modal-desc">
              You attempted to quit or close the examination window. Exiting without prior authorization from the invigilator is classified as <strong>Unfair Means (UFM)</strong> and may result in immediate test disqualification.
            </p>

            <div className="invigilator-override-box">
              <label>Invigilator Override PIN (To Authorized Exit):</label>
              <div className="pin-input-row">
                <input
                  type="password"
                  placeholder="Enter PIN (e.g., invigilo2026)"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError("");
                  }}
                  className="input-pin"
                />
                <button
                  type="button"
                  onClick={handleVerifyPinAndQuit}
                  className="btn btn-danger-sm"
                >
                  Authorized Quit
                </button>
              </div>
              {pinError && <span className="pin-error-text">{pinError}</span>}
            </div>

            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onDismiss}
                className="btn btn-primary"
              >
                Continue Exam & Cancel Quit
              </button>
            </div>
          </div>
        )}

        {/* SUBMIT CONFIRMATION */}
        {type === "submit" && (
          <div className="warning-content submit-confirm">
            <div className="modal-icon-badge icon-blue">📋</div>
            <h2>Ready to Submit Your Exam?</h2>
            <p className="modal-desc">
              Please review your summary before finalizing. Once submitted, your test session will end and kiosk mode will be released.
            </p>

            <div className="submit-summary-grid">
              <div className="summary-stat-box">
                <span className="stat-label">Total Questions</span>
                <span className="stat-val">{totalQuestions}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Answered</span>
                <span className="stat-val stat-green">{answeredCount}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Unanswered</span>
                <span className="stat-val stat-red">{totalQuestions - answeredCount}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Marked for Review</span>
                <span className="stat-val stat-purple">{markedCount}</span>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="modal-notice-box notice-warning">
                ⚠️ You still have {totalQuestions - answeredCount} unanswered question(s). You can go back and answer them before submitting.
              </div>
            )}

            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onDismiss}
                className="btn btn-outline"
              >
                ← Return to Exam
              </button>
              <button
                type="button"
                onClick={onSubmitConfirm}
                className="btn btn-success-primary"
              >
                Yes, Submit Exam
              </button>
            </div>
          </div>
        )}

        {/* SESSION RESUME */}
        {type === "resume" && (
          <div className="warning-content resume-prompt">
            <div className="modal-icon-badge icon-blue">🔄</div>
            <h2>Active Exam Session Detected</h2>
            <p className="modal-desc">
              Invigilo detected an active exam session from a previous launch. Your answers and remaining time have been recovered.
            </p>

            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onResumeDiscard}
                className="btn btn-outline"
              >
                Discard & Start New
              </button>
              <button
                type="button"
                onClick={onResumeConfirm}
                className="btn btn-primary"
              >
                Resume Saved Exam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
