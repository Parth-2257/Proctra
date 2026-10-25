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
      setPinError("Incorrect PIN. Please enter: invigilo2026");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* BLUR / TAB SWITCH WARNING */}
        {type === "blur" && (
          <div className="warning-content">
            <h2>Warning: Window Focus Lost</h2>
            <p className="warning-strike-text">
              Strike <strong>{violationsCount} of 3</strong>
            </p>
            <p className="modal-desc">
              You navigated away from the exam or switched to another window. All focus switching is recorded.
              Please stay on the test screen to avoid test cancellation.
            </p>
            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onDismiss}
                className="btn btn-blue"
              >
                Return to Exam
              </button>
            </div>
          </div>
        )}

        {/* QUIT ATTEMPT WARNING */}
        {type === "quit" && (
          <div className="warning-content">
            <h2>Exit Test Confirmation</h2>
            <p className="modal-desc">
              Exiting the test early without invigilator permission is recorded as an unapproved exit.
              To exit, enter the authorization PIN below:
            </p>

            <div className="invigilator-override-box">
              <label>Authorization PIN:</label>
              <div className="pin-input-row">
                <input
                  type="text"
                  placeholder="PIN is: invigilo2026"
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
                  className="btn btn-danger"
                >
                  Confirm Exit
                </button>
              </div>
              {pinError && <span className="pin-error-text">{pinError}</span>}
            </div>

            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onDismiss}
                className="btn btn-blue"
              >
                Cancel & Continue Exam
              </button>
            </div>
          </div>
        )}

        {/* SUBMIT CONFIRMATION */}
        {type === "submit" && (
          <div className="warning-content">
            <h2>Submit Exam</h2>
            <p className="modal-desc">
              Are you sure you want to finish and submit your exam?
            </p>

            <div className="submit-summary-grid">
              <div className="summary-stat-box">
                <span className="stat-label">Total Questions</span>
                <span className="stat-val">{totalQuestions}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Answered</span>
                <span className="stat-val">{answeredCount}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Unanswered</span>
                <span className="stat-val">{totalQuestions - answeredCount}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Marked for Review</span>
                <span className="stat-val">{markedCount}</span>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <p className="modal-unanswered-warn">
                Note: You have {totalQuestions - answeredCount} unanswered question(s).
              </p>
            )}

            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onDismiss}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmitConfirm}
                className="btn btn-blue"
              >
                Submit Now
              </button>
            </div>
          </div>
        )}

        {/* SESSION RESUME */}
        {type === "resume" && (
          <div className="warning-content">
            <h2>Resume Saved Session</h2>
            <p className="modal-desc">
              An ongoing exam session was found. Would you like to resume your progress or start over?
            </p>

            <div className="modal-actions-split">
              <button
                type="button"
                onClick={onResumeDiscard}
                className="btn btn-outline"
              >
                Start Over
              </button>
              <button
                type="button"
                onClick={onResumeConfirm}
                className="btn btn-blue"
              >
                Resume Exam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
