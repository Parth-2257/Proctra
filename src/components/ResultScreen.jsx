export default function ResultScreen({
  questions,
  answers,
  violationsCount,
  onExit,
}) {
  const total = questions.length;
  let correctCount = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const attemptedCount = Object.keys(answers).length;
  const incorrectCount = attemptedCount - correctCount;
  const skippedCount = total - attemptedCount;
  const scorePercent = Math.round((correctCount / total) * 100);

  return (
    <div className="page-container result-page">
      <div className="header-section">
        <h1>Exam Results</h1>
        <p>Your test has been successfully submitted and evaluated.</p>
      </div>

      <div className="card-container result-card">
        {/* Score Header Card */}
        <div className="score-summary-banner">
          <div className="score-main">
            <span className="score-number">{correctCount} / {total}</span>
            <span className="score-label">Questions Correct ({scorePercent}%)</span>
          </div>

          <div className="score-chips">
            <div className="score-chip chip-correct">
              <span className="chip-label">Correct</span>
              <span className="chip-val">{correctCount}</span>
            </div>
            <div className="score-chip chip-incorrect">
              <span className="chip-label">Incorrect</span>
              <span className="chip-val">{incorrectCount}</span>
            </div>
            <div className="score-chip chip-skipped">
              <span className="chip-label">Skipped</span>
              <span className="chip-val">{skippedCount}</span>
            </div>
            <div className="score-chip">
              <span className="chip-label">Total Questions</span>
              <span className="chip-val">{total}</span>
            </div>
          </div>
        </div>

        {/* Proctoring & Integrity Result */}
        <div className={`integrity-card ${violationsCount === 0 ? "integrity-clean" : "integrity-flagged"}`}>
          <div className="integrity-status-header">
            <h4>Proctoring & Integrity Result</h4>
            <span className={`status-pill ${violationsCount === 0 ? "status-pass" : "status-warn"}`}>
              {violationsCount === 0 ? "PASSED • CLEAN" : "FLAGGED FOR REVIEW"}
            </span>
          </div>
          <p className="integrity-desc">
            {violationsCount === 0
              ? "No malpractice, window switching, focus losses, or illegal exit attempts were detected during your examination session."
              : `Warning: ${violationsCount} incident(s) of application focus loss or tab switching were caught and logged during the test. This has been attached to your submission report.`}
          </p>
        </div>

        {/* Questions Breakdown */}
        <div className="questions-review-section">
          <h3>Question-by-Question Review</h3>
          <div className="questions-review-list">
            {questions.map((q, idx) => {
              const selectedIdx = answers[q.id];
              const isAnswered = selectedIdx !== undefined;
              const isCorrect = isAnswered && selectedIdx === q.correctAnswer;

              return (
                <div key={q.id} className="review-question-row">
                  <div className="review-q-header">
                    <span className="review-q-num">Q{idx + 1}. {q.question}</span>
                    <span className={`review-badge ${!isAnswered ? "badge-skipped" : isCorrect ? "badge-correct" : "badge-incorrect"}`}>
                      {!isAnswered ? "Skipped" : isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>

                  <div className="review-options-summary">
                    <div className="review-ans-item">
                      <span className="ans-label">Your Answer:</span>
                      <span className={`ans-text ${!isAnswered ? "text-muted" : isCorrect ? "text-green" : "text-red"}`}>
                        {isAnswered
                          ? `${String.fromCharCode(65 + selectedIdx)}: ${q.options[selectedIdx]}`
                          : "Not Attempted"}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="review-ans-item">
                        <span className="ans-label">Correct Answer:</span>
                        <span className="ans-text text-green">
                          {String.fromCharCode(65 + q.correctAnswer)}: {q.options[q.correctAnswer]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bottom-actions result-actions">
        <button
          type="button"
          onClick={onExit}
          className="btn btn-blue"
        >
          Close & Exit Application
        </button>
      </div>
    </div>
  );
}
