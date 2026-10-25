import { useState } from "react";

export default function InstructionsScreen({ onStartTest, onBackToPermissions }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="page-container">
      <div className="header-section">
        <h1>Exam Instructions</h1>
        <p>Please read these instructions carefully before starting the test.</p>
      </div>

      <div className="card-container instructions-card">
        <div className="instruction-item">
          <div className="instruction-number">1</div>
          <div className="instruction-text">
            <h4>Fullscreen Requirement</h4>
            <p>
              The exam must remain in fullscreen mode. Exiting fullscreen or minimizing the application
              will register as an exam strike.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">2</div>
          <div className="instruction-text">
            <h4>No Tab or Window Switching</h4>
            <p>
              Do not switch tabs, open other applications, or press Alt+Tab / Cmd+Tab. Any loss of window
              focus is logged as a violation.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">3</div>
          <div className="instruction-text">
            <h4>Camera & Microphone Monitoring</h4>
            <p>
              Your camera and microphone must remain connected throughout the test. Random photo snapshots
              are recorded to verify identity.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">4</div>
          <div className="instruction-text">
            <h4>Question Navigation & Submission</h4>
            <p>
              You can navigate between questions using Next, Previous, or the Question Palette on the right.
              Submit your test before the timer expires.
            </p>
          </div>
        </div>

        <div className="agreement-box">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I have read and agree to comply with all examination rules and proctoring requirements.
            </span>
          </label>
        </div>
      </div>

      <div className="bottom-actions instructions-actions">
        <button
          type="button"
          onClick={onBackToPermissions}
          className="btn btn-outline"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onStartTest}
          disabled={!agreed}
          className={`btn ${agreed ? "btn-blue" : "btn-disabled"}`}
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
