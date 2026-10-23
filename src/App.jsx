import "./App.css";

function App() {
  return (
    <div className="page-container">
      <div className="header-section">
        <h1>Hi User!</h1>
        <p>Kindly Allow the following Permissions to Start the test:</p>
      </div>

      <div className="card-container">
        <div className="permission-item">
          <div className="permission-icon">↗</div>
          <div className="permission-content">
            <h3>Configure Camera</h3>
            <p>Kindly configure Camera to attempt quiz/contests.</p>
          </div>
        </div>

        <div className="divider" />

        <div className="permission-item">
          <div className="permission-icon">⛶</div>
          <div className="permission-content">
            <h3>Switch to full screen</h3>
            <p>Kindly close all tabs and switch to full screen.</p>
          </div>
        </div>
      </div>

      <div className="bottom-actions">
        <button className="btn btn-light-blue">Go To Test</button>
        <button className="btn btn-outline">Need Help?</button>
      </div>
    </div>
  );
}

export default App;
