import { useState } from "react";

export default function InstructionsScreen({ onStartTest, onBackToPermissions }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="page-container">
      <div className="header-section">
        <div className="badge-tag">INVIGILO PROCTORING PROTOCOL</div>
        <h1>Candidate Exam Instructions & Guidelines</h1>
        <p>Please read these instructions thoroughly before initiating the proctored test session.</p>
      </div>

      <div className="card-container instructions-card">
        <div className="instruction-item">
          <div className="instruction-number">1</div>
          <div className="instruction-text">
            <h4>Mandatory Fullscreen Lockdown</h4>
            <p>
              The exam runs in a locked kiosk fullscreen environment. Any attempt to exit fullscreen,
              minimize the window, or resize will immediately register as an examination violation.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">2</div>
          <div className="instruction-text">
            <h4>Prohibition on Tab & Application Switching</h4>
            <p>
              Multitasking, keyboard shortcuts (Alt+Tab, Cmd+Tab), and background applications are strictly monitored.
              Window focus loss triggers immediate warning strikes. Exceeding 3 strikes flags the session for cancellation.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">3</div>
          <div className="instruction-text">
            <h4>Continuous Camera & Microphone Surveillance</h4>
            <p>
              Your camera and microphone must remain unobstructed with your face centered in good lighting.
              Automated proctoring periodically captures snapshots and audio telemetry throughout the session.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">4</div>
          <div className="instruction-text">
            <h4>Exam Navigation & Palette</h4>
            <p>
              You can navigate between questions using the Question Palette on the right or the Previous/Next buttons.
              Use 'Mark for Review' to bookmark questions you want to reconsider before final submission.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="instruction-item">
          <div className="instruction-number">5</div>
          <div className="instruction-text">
            <h4>Strict Submission & Malpractice (UFM) Notice</h4>
            <p>
              Only submit when you are completely finished. Exiting prematurely or force-quitting the application
              without invigilator authorization will be classified as Unfair Means (UFM) with automatic zero score.
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
              I confirm that my testing space is isolated, my webcam and microphone are functioning properly,
              and I agree to comply with all Invigilo Proctoring guidelines.
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
          ← Back to Permissions
        </button>

        <button
          type="button"
          onClick={onStartTest}
          disabled={!agreed}
          className={`btn ${agreed ? "btn-primary-active" : "btn-disabled"}`}
        >
          Start Test Now 🚀
        </button>
      </div>
    </div>
  );
}
