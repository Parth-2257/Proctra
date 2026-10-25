import { useState, useRef, useEffect } from "react";

export default function InstructionsScreen({
  onStartTest,
  onBackToPermissions,
  mediaStream,
}) {
  const [agreed, setAgreed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div className="instructions-page-wrapper">
      <div className="instructions-split-layout">
        {/* Left Column: Instructions & Information */}
        <div className="instructions-left-col">
          <div className="instructions-header">
            <h1>Exam Instructions & Guidelines</h1>
            <p>Please read these guidelines thoroughly before entering the exam environment.</p>
          </div>

          <div className="exam-meta-strip">
            <span className="meta-item">⏱ <strong>Duration:</strong> 60 Mins</span>
            <span className="meta-item">📋 <strong>Questions:</strong> 8 MCQs</span>
            <span className="meta-item">🛡️ <strong>Kiosk Mode:</strong> Locked</span>
          </div>

          <div className="instructions-list-container">
            <div className="instruction-row">
              <div className="instruction-step">1</div>
              <div className="instruction-details">
                <h4>Fullscreen Kiosk Lockdown</h4>
                <p>
                  The test runs in a locked fullscreen environment. Minimizing the window or attempting to exit
                  will immediately register as an examination violation strike.
                </p>
              </div>
            </div>

            <div className="divider" />

            <div className="instruction-row">
              <div className="instruction-step">2</div>
              <div className="instruction-details">
                <h4>No Tab or Window Switching</h4>
                <p>
                  Do not switch tabs, open secondary applications, or use keyboard shortcuts (Alt+Tab, Cmd+Tab).
                  Application focus losses are logged with timestamps.
                </p>
              </div>
            </div>

            <div className="divider" />

            <div className="instruction-row">
              <div className="instruction-step">3</div>
              <div className="instruction-details">
                <h4>Continuous Camera & Microphone Surveillance</h4>
                <p>
                  Your webcam and microphone must remain unobstructed. Keep your face centered in the camera
                  window with adequate lighting throughout the session.
                </p>
              </div>
            </div>

            <div className="divider" />

            <div className="instruction-row">
              <div className="instruction-step">4</div>
              <div className="instruction-details">
                <h4>Navigation & Final Submission</h4>
                <p>
                  Use the Question Palette on the right to navigate between questions. You can mark questions
                  for review and submit once you have completed all sections.
                </p>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="agreement-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I confirm that I am seated in a quiet room, my camera feed is clear, and I agree to strictly
                comply with all examination rules.
              </span>
            </label>
          </div>

          <div className="instructions-left-actions">
            <button
              type="button"
              onClick={onBackToPermissions}
              className="btn btn-outline"
            >
              ← Back to Permissions
            </button>
          </div>
        </div>

        {/* Right Column: Tall Centered Camera Window + Start Test Button */}
        <div className="instructions-right-col">
          <div className="camera-verification-card">
            <div className="camera-card-header">
              <h3>Webcam Feed Verification</h3>
              <span className="live-camera-tag">
                <span className="live-dot"></span> Live Feed
              </span>
            </div>

            {/* Video preview container with increased length/height */}
            <div className="camera-feed-viewport">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="instructions-video-stream"
              />

              {/* Subdued proctoring face centering guide */}
              <div className="face-oval-guide">
                <div className="face-guide-crosshairs"></div>
              </div>

              <div className="viewport-overlay-bottom">
                <span>Position your face within the frame</span>
              </div>
            </div>

            {/* Environment Readiness Checklist */}
            <div className="readiness-checklist">
              <div className="readiness-item ready">
                <span className="check-icon">✓</span> Face Centered & Visible
              </div>
              <div className="readiness-item ready">
                <span className="check-icon">✓</span> Good Lighting Verified
              </div>
              <div className="readiness-item ready">
                <span className="check-icon">✓</span> Microphone Audio Active
              </div>
            </div>

            {/* Start Test button placed directly below the camera */}
            <div className="start-test-action-box">
              <button
                type="button"
                onClick={onStartTest}
                disabled={!agreed}
                className={`btn ${agreed ? "btn-blue" : "btn-disabled"} btn-start-test`}
              >
                Start Test Now →
              </button>
              {!agreed && (
                <span className="start-disabled-hint">
                  Please accept the examination rules on the left to start.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
