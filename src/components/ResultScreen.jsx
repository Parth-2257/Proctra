export default function ResultScreen({
  questions,
  answers,
  markedForReview,
  violationsCount,
  onOpenInvigilator,
  onExit,
}) {
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const unanswered = total - answered;
  const marked = markedForReview.length;

  return (
    <div className="page-container result-page">
      <div className="header-section">
        <div className="badge-tag tag-success">EXAMINATION SUBMITTED SUCCESSFULLY</div>
        <h1>Assessment & Proctoring Completion Report</h1>
        <p>Your responses have been securely encrypted and submitted to the evaluation server.</p>
      </div>

      <div className="card-container result-card">
        {/* Compliance Banner */}
        <div className={`compliance-banner ${violationsCount === 0 ? "compliance-clean" : "compliance-flagged"}`}>
          <div className="compliance-icon">
            {violationsCount === 0 ? "🛡️" : "⚠️"}
          </div>
          <div className="compliance-info">
            <h4>
              {violationsCount === 0
                ? "Clean Proctoring Record — High Integrity"
                : `Proctoring Audit: ${violationsCount} Warning Strike(s) Recorded`}
            </h4>
            <p>
              {violationsCount === 0
                ? "No window switching, focus losses, or unauthorized exit attempts were observed."
                : "Application focus deviations occurred. Telemetry and snapshots have been archived for invigilator scrutiny."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="result-stats-grid">
          <div className="result-stat-box">
            <span className="res-stat-num">{total}</span>
            <span className="res-stat-name">Total Questions</span>
          </div>

          <div className="result-stat-box">
            <span className="res-stat-num stat-green">{answered}</span>
            <span className="res-stat-name">Attempted</span>
          </div>

          <div className="result-stat-box">
            <span className="res-stat-num stat-red">{unanswered}</span>
            <span className="res-stat-name">Unattempted</span>
          </div>

          <div className="result-stat-box">
            <span className="res-stat-num stat-purple">{marked}</span>
            <span className="res-stat-name">Marked for Review</span>
          </div>
        </div>

        {/* Questions breakdown */}
        <div className="responses-summary-list">
          <h4>Submitted Question Responses</h4>
          <div className="response-chips-grid">
            {questions.map((q, idx) => {
              const ansIdx = answers[q.id];
              const isAns = ansIdx !== undefined;
              return (
                <div
                  key={q.id}
                  className={`response-chip ${isAns ? "chip-answered" : "chip-unanswered"}`}
                >
                  <span className="chip-q">Q{idx + 1}:</span>
                  <span className="chip-val">
                    {isAns ? `Option ${String.fromCharCode(65 + ansIdx)}` : "Skipped"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bottom-actions result-actions">
        <button
          type="button"
          onClick={onOpenInvigilator}
          className="btn btn-outline"
        >
          🛡️ View Proctoring Audit Log
        </button>

        <button
          type="button"
          onClick={onExit}
          className="btn btn-primary"
        >
          Exit Assessment Application
        </button>
      </div>
    </div>
  );
}
