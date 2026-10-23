import { useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);

  async function getCamera() {
    const videoData = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = videoData;

    setCameraReady(true);
  }

  async function getFullscreen() {
    await window.electronAPI.setFullScreen();
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        className={cameraReady ? "video-preview" : "hidden-video"}
      />

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
              <div className="action-row">
                <button onClick={getCamera} className="btn btn-dark">
                  Get Camera Access
                </button>
              </div>
              {cameraReady && <div className="camera-space" />}
            </div>
          </div>

          <div className="divider" />

          <div className="permission-item">
            <div className="permission-icon">⛶</div>

            <div className="permission-content">
              <h3>Switch to full screen</h3>

              <p>Kindly close all tabs and switch to full screen.</p>

              <button onClick={getFullscreen} className="btn btn-light-blue">
                Give Full Screen Permissions
              </button>
            </div>
          </div>
        </div>

        <div className="bottom-actions">
          <button className="btn btn-light-blue">Go To Test</button>
          <button className="btn btn-outline">Need Help?</button>
        </div>
      </div>
    </>
  );
}

export default App;
