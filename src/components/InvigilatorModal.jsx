import { useState, useEffect, useCallback } from "react";

export default function InvigilatorModal({ isOpen, onClose, onForceQuit }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("logs"); // "logs" | "photos"
  const [auditData, setAuditData] = useState({ logs: [], photos: [] });
  const [loading, setLoading] = useState(false);

  const loadAuditData = useCallback(async () => {
    setLoading(true);
    try {
      if (window.electronAPI?.getAuditLogs) {
        const res = await window.electronAPI.getAuditLogs();
        setAuditData(res || { logs: [], photos: [] });
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && isAuthenticated && window.electronAPI?.getAuditLogs) {
      window.electronAPI.getAuditLogs().then((res) => {
        if (isMounted) {
          setAuditData(res || { logs: [], photos: [] });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin.trim() === "invigilo2026" || pin.trim() === "admin123" || pin.trim() === "1234") {
      setIsAuthenticated(true);
      setPinError("");
      loadAuditData();
    } else {
      setPinError("Invalid Invigilator Credentials.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card invigilator-modal">
        <div className="modal-header-bar">
          <div className="invigilator-title">
            <span>🛡️</span>
            <h3>Invigilo Proctoring Review Dashboard</h3>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            ✕
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="pin-auth-form">
            <p>Enter Invigilator Security PIN to inspect live telemetry and incident snapshots.</p>
            <div className="pin-row">
              <input
                type="password"
                autoFocus
                placeholder="PIN (Default: invigilo2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-pin"
              />
              <button type="submit" className="btn btn-primary">
                Unlock Dashboard
              </button>
            </div>
            {pinError && <span className="pin-error-text">{pinError}</span>}
          </form>
        ) : (
          <div className="invigilator-dashboard-body">
            {/* Tabs */}
            <div className="invigilator-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === "logs" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("logs")}
              >
                Incident Audit Logs ({auditData.logs.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "photos" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("photos")}
              >
                Proctor Snapshots ({auditData.photos.length})
              </button>
              <button
                type="button"
                onClick={loadAuditData}
                className="btn btn-refresh-sm"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="loading-state">Loading telemetry logs...</div>
            ) : (
              <div className="tab-pane-content">
                {activeTab === "logs" && (
                  <div className="logs-table-container">
                    {auditData.logs.length === 0 ? (
                      <p className="empty-notice">No audit logs recorded yet.</p>
                    ) : (
                      <table className="audit-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Event Type</th>
                            <th>Incident Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditData.logs.map((log, i) => (
                            <tr
                              key={i}
                              className={
                                log.type === "window_blur" || log.type === "quit_attempt"
                                  ? "row-incident"
                                  : ""
                              }
                            >
                              <td className="log-time">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td>
                                <span className={`log-badge badge-${log.type}`}>
                                  {log.type}
                                </span>
                              </td>
                              <td>{log.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "photos" && (
                  <div className="photos-gallery-grid">
                    {auditData.photos.length === 0 ? (
                      <p className="empty-notice">No snapshots recorded yet.</p>
                    ) : (
                      auditData.photos.map((item, idx) => (
                        <div key={idx} className="snapshot-card">
                          <img
                            src={item.dataUrl}
                            alt={item.fileName}
                            className="snapshot-img"
                          />
                          <div className="snapshot-meta">
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                            <span className="snapshot-type">{item.fileName.split("-")[1]}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="invigilator-footer">
              <button
                type="button"
                onClick={onForceQuit}
                className="btn btn-danger"
              >
                🚨 Terminate Exam for Malpractice (UFM)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
