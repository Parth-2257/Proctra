import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";
import Header from "./components/Header";
import PermissionScreen from "./components/PermissionScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import MainExam from "./components/MainExam";
import ResultScreen from "./components/ResultScreen";
import WarningModal from "./components/WarningModal";
import InvigilatorModal from "./components/InvigilatorModal";
import { DEFAULT_QUESTIONS } from "./data/questions";

const SESSION_STORAGE_KEY = "invigilo_active_session";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Screen State: "permissions" | "instructions" | "exam" | "results"
  const [screen, setScreen] = useState("permissions");

  // Hardware states
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [fullscreenReady, setFullscreenReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [micError, setMicError] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  // Exam states
  const [questions] = useState(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([DEFAULT_QUESTIONS[0]?.id || 1]);
  const [violationsCount, setViolationsCount] = useState(0);
  const [remainingTimeMs, setRemainingTimeMs] = useState(60 * 60 * 1000);

  // Modals - initialize resume modal if active session exists
  const [activeModal, setActiveModal] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.screen === "exam" && parsed.remainingTimeMs > 0) {
          return "resume";
        }
      }
    } catch (e) {
      console.error("Failed to parse initial session:", e);
    }
    return null;
  });
  const [isInvigilatorOpen, setIsInvigilatorOpen] = useState(false);

  // Final submit handler
  const handleFinalSubmit = useCallback(async () => {
    setActiveModal(null);
    if (window.electronAPI?.endTest) {
      await window.electronAPI.endTest();
    }
    setFullscreenReady(false);
    setScreen("results");
  }, []);

  // Capture webcam snapshot helper
  const captureWebcamFrame = useCallback(async (type = "periodic_webcam") => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    if (window.electronAPI?.savePhoto) {
      await window.electronAPI.savePhoto(dataUrl, type);
    }
  }, []);

  // 1. Fullscreen sync with Electron
  useEffect(() => {
    if (window.electronAPI?.isFullScreen) {
      window.electronAPI.isFullScreen().then((isFs) => setFullscreenReady(Boolean(isFs)));
    }

    if (window.electronAPI?.onFullScreenChange) {
      const cleanup = window.electronAPI.onFullScreenChange((isFs) => {
        setFullscreenReady(Boolean(isFs));
        if (!isFs && screen === "exam") {
          setViolationsCount((prev) => prev + 1);
          setActiveModal("blur");
        }
      });
      return () => cleanup && cleanup();
    }
  }, [screen]);

  // 2. Window blur & quit attempt listeners during active exam
  useEffect(() => {
    if (screen !== "exam") return;

    const handleBlur = () => {
      setViolationsCount((prev) => prev + 1);
      setActiveModal("blur");
    };

    window.addEventListener("blur", handleBlur);

    const unsubBlur = window.electronAPI?.onWindowBlur ? window.electronAPI.onWindowBlur(handleBlur) : null;
    const unsubQuit = window.electronAPI?.onQuitAttempt
      ? window.electronAPI.onQuitAttempt(() => setActiveModal("quit"))
      : null;

    return () => {
      window.removeEventListener("blur", handleBlur);
      if (unsubBlur) unsubBlur();
      if (unsubQuit) unsubQuit();
    };
  }, [screen]);

  // 3. Exam Timer Countdown
  useEffect(() => {
    if (screen !== "exam") return;

    const timer = setInterval(async () => {
      if (window.electronAPI?.getRemainingTime) {
        const ms = await window.electronAPI.getRemainingTime();
        setRemainingTimeMs(ms);
        if (ms <= 0) {
          clearInterval(timer);
          handleFinalSubmit();
        }
      } else {
        setRemainingTimeMs((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1000;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, handleFinalSubmit]);

  // 4. Save session state while exam is active
  useEffect(() => {
    if (screen === "exam") {
      const sessionData = {
        screen,
        answers,
        markedForReview,
        visitedQuestions,
        currentQuestionIndex,
        violationsCount,
        remainingTimeMs,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } else if (screen === "results") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [screen, answers, markedForReview, visitedQuestions, currentQuestionIndex, violationsCount, remainingTimeMs]);

  // 5. Periodic Proctoring Snapshots
  useEffect(() => {
    if (screen !== "exam") return;

    const photoInterval = setInterval(() => {
      captureWebcamFrame("periodic_webcam");
    }, 15000);

    const screenInterval = setInterval(() => {
      if (window.electronAPI?.captureScreen) {
        window.electronAPI.captureScreen("periodic_screen");
      }
    }, 45000);

    return () => {
      clearInterval(photoInterval);
      clearInterval(screenInterval);
    };
  }, [screen, captureWebcamFrame]);

  // Hardware: Request Camera Access
  const handleGetCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setCameraReady(false);
          setCameraError("Camera disconnected or access was revoked.");
        };
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraReady(false);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Permission denied. Please allow camera permissions in system settings."
          : `Camera unavailable: ${err.message}`
      );
    }
  };

  // Hardware: Request Microphone Access & Audio Analysis
  const handleGetMic = async () => {
    setMicError("");
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicReady(true);

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onended = () => {
          setMicReady(false);
          setMicError("Microphone disconnected or access revoked.");
        };
      }
    } catch (err) {
      console.error("Microphone access failed:", err);
      setMicReady(false);
      setMicError(
        err.name === "NotAllowedError"
          ? "Permission denied. Please allow microphone permissions."
          : `Microphone unavailable: ${err.message}`
      );
    }
  };

  // Hardware: Toggle Fullscreen
  const handleToggleFullscreen = async () => {
    if (window.electronAPI?.setFullScreen) {
      const newState = !fullscreenReady;
      const res = await window.electronAPI.setFullScreen(newState);
      setFullscreenReady(Boolean(res));
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setFullscreenReady(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setFullscreenReady(false)).catch(() => {});
      }
    }
  };

  // Navigation handlers
  const handleProceedToInstructions = () => {
    setScreen("instructions");
  };

  const handleStartExam = async () => {
    if (window.electronAPI?.startTest) {
      await window.electronAPI.startTest(60);
    }
    setFullscreenReady(true);
    setScreen("exam");
    setTimeout(() => captureWebcamFrame("exam_start_baseline"), 1000);
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setVisitedQuestions((prev) => (prev.includes(qId) ? prev : [...prev, qId]));
  };

  const handleClearAnswer = (qId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleMarkForReview = (qId) => {
    setMarkedForReview((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleQuestionChange = (newIndex) => {
    setCurrentQuestionIndex(newIndex);
    const targetQId = questions[newIndex]?.id;
    if (targetQId) {
      setVisitedQuestions((prev) => (prev.includes(targetQId) ? prev : [...prev, targetQId]));
    }
  };

  // Session recovery handlers
  const handleResumeConfirm = () => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setMarkedForReview(parsed.markedForReview || []);
        setVisitedQuestions(parsed.visitedQuestions || [1]);
        setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
        setViolationsCount(parsed.violationsCount || 0);
        setRemainingTimeMs(parsed.remainingTimeMs || 60 * 60 * 1000);
        setScreen("exam");
        if (window.electronAPI?.setFullScreen) {
          window.electronAPI.setFullScreen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setActiveModal(null);
  };

  const handleResumeDiscard = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setActiveModal(null);
  };

  const handleInvigilatorForceQuit = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (window.electronAPI?.forceQuit) {
      window.electronAPI.forceQuit();
    } else {
      window.close();
    }
  };

  // Formatted countdown time
  const formatTime = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSec / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSec % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="invigilo-app">
      {/* Background Persistent Camera & Canvas */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cameraReady && screen !== "exam" && screen !== "results" ? "video-preview" : "hidden-video"}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Main Header */}
      <Header
        screen={screen}
        fullscreenReady={fullscreenReady}
        cameraReady={cameraReady}
        micReady={micReady}
        timeFormatted={formatTime(remainingTimeMs)}
        onOpenInvigilator={() => setIsInvigilatorOpen(true)}
      />

      {/* View router */}
      {screen === "permissions" && (
        <PermissionScreen
          cameraReady={cameraReady}
          micReady={micReady}
          fullscreenReady={fullscreenReady}
          onGetCamera={handleGetCamera}
          onGetMic={handleGetMic}
          onToggleFullscreen={handleToggleFullscreen}
          onProceedToInstructions={handleProceedToInstructions}
          cameraError={cameraError}
          micError={micError}
          audioLevel={audioLevel}
        />
      )}

      {screen === "instructions" && (
        <InstructionsScreen
          onStartTest={handleStartExam}
          onBackToPermissions={() => setScreen("permissions")}
        />
      )}

      {screen === "exam" && (
        <MainExam
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={handleQuestionChange}
          answers={answers}
          onSelectAnswer={handleSelectAnswer}
          onClearAnswer={handleClearAnswer}
          markedForReview={markedForReview}
          onToggleMarkForReview={handleToggleMarkForReview}
          visitedQuestions={visitedQuestions}
          violationsCount={violationsCount}
          onOpenSubmitModal={() => setActiveModal("submit")}
        />
      )}

      {screen === "results" && (
        <ResultScreen
          questions={questions}
          answers={answers}
          markedForReview={markedForReview}
          violationsCount={violationsCount}
          onOpenInvigilator={() => setIsInvigilatorOpen(true)}
          onExit={handleInvigilatorForceQuit}
        />
      )}

      {/* Warning & Confirmation Modals */}
      {activeModal && (
        <WarningModal
          type={activeModal}
          violationsCount={violationsCount}
          totalQuestions={questions.length}
          answeredCount={Object.keys(answers).length}
          markedCount={markedForReview.length}
          onDismiss={() => setActiveModal(null)}
          onSubmitConfirm={handleFinalSubmit}
          onResumeConfirm={handleResumeConfirm}
          onResumeDiscard={handleResumeDiscard}
          onInvigilatorQuit={handleInvigilatorForceQuit}
        />
      )}

      {/* Invigilator Review Panel */}
      <InvigilatorModal
        isOpen={isInvigilatorOpen}
        onClose={() => setIsInvigilatorOpen(false)}
        onForceQuit={handleInvigilatorForceQuit}
      />
    </div>
  );
}

export default App;
