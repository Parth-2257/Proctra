import { useRef, useEffect } from "react";

export default function MainExam({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  onSelectAnswer,
  onClearAnswer,
  markedForReview,
  onToggleMarkForReview,
  visitedQuestions,
  violationsCount,
  onOpenSubmitModal,
  mediaStream,
}) {
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const examVideoRef = useRef(null);

  useEffect(() => {
    if (examVideoRef.current && mediaStream) {
      examVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const currentAnswer = answers[currentQuestion.id];
  const isMarked = markedForReview.includes(currentQuestion.id);

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="exam-layout">
      {/* Main Content Area */}
      <main className="exam-main-panel">
        <div className="exam-toolbar">
          <div className="question-category-tag">
            <span>Subject:</span> <strong>{currentQuestion.category || "General"}</strong>
          </div>

          <div className="exam-toolbar-right">
            <span className={`violations-pill ${violationsCount > 0 ? "has-violations" : ""}`}>
              Warnings / Focus Loss: <strong>{violationsCount}</strong>
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-counter">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            {isMarked && <span className="status-badge badge-purple">Marked for Review</span>}
          </div>

          <p className="question-prompt">{currentQuestion.question}</p>

          {/* Options */}
          <div className="options-container">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentAnswer === idx;
              return (
                <label
                  key={idx}
                  className={`option-row ${isSelected ? "option-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected}
                    onChange={() => onSelectAnswer(currentQuestion.id, idx)}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="option-text">{option}</span>
                </label>
              );
            })}
          </div>

          {/* Card Action Buttons */}
          <div className="card-actions-bar">
            <div className="action-buttons-left">
              <button
                type="button"
                onClick={() => onToggleMarkForReview(currentQuestion.id)}
                className={`btn ${isMarked ? "btn-blue" : "btn-outline"}`}
              >
                {isMarked ? "Unmark Review" : "Mark for Review"}
              </button>

              {currentAnswer !== undefined && (
                <button
                  type="button"
                  onClick={() => onClearAnswer(currentQuestion.id)}
                  className="btn btn-outline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="action-buttons-right">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="btn btn-outline"
              >
                ← Previous
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                  }
                  className="btn btn-blue"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSubmitModal}
                  className="btn btn-blue"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Question Palette & Proctor HUD */}
      <aside className="exam-sidebar">
        {/* Proctoring HUD Camera View */}
        <div className="proctor-hud-card">
          <div className="hud-card-header">
            <h4>Proctoring Active</h4>
            <span className="live-camera-tag">
              <span className="live-dot"></span> Live
            </span>
          </div>

          <div className="hud-video-box">
            <video
              ref={examVideoRef}
              autoPlay
              playsInline
              muted
              className="hud-video-feed"
            />
          </div>

          <p className="hud-caption">Camera feed and window focus are actively monitored.</p>
        </div>

        {/* Question Palette */}
        <div className="palette-card">
          <h4>Questions Palette</h4>

          <div className="palette-grid">
            {questions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined;
              const isMrk = markedForReview.includes(q.id);
              const isCurr = idx === currentQuestionIndex;
              const isVis = visitedQuestions.includes(q.id);

              let itemClass = "palette-unvisited";
              if (isAns) {
                itemClass = "palette-answered";
              } else if (isMrk) {
                itemClass = "palette-marked";
              } else if (isVis) {
                itemClass = "palette-visited";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`palette-btn ${itemClass} ${isCurr ? "palette-current" : ""}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="palette-legend">
            <div className="legend-row">
              <span className="legend-dot dot-answered"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot dot-marked"></span>
              <span>Marked for Review ({markedCount})</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot dot-unanswered"></span>
              <span>Unanswered ({unansweredCount})</span>
            </div>
          </div>

          <div className="palette-submit-section">
            <button
              type="button"
              onClick={onOpenSubmitModal}
              className="btn btn-blue btn-block"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
