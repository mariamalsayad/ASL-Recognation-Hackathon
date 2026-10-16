import { Button } from "@/components/ui/button";
import { useSignRecorder } from "@/hooks/useSignRecorder";
import { speak } from "@/lib/api";
import ConfirmWordDialog from "@/component/alertDialog";
import { useState, type CSSProperties } from "react";

const STEPS = [
  {
    title: "Start your camera",
    text: "Allow camera access so Beyond Words can see your hands.",
  },
  {
    title: "Position your hands",
    text: "Keep your hands clearly visible inside the camera frame.",
  },
  {
    title: "Click Recognize Sign",
    text: "Click the Recognize Sign button when you are ready.",
  },
  {
    title: "Perform your sign",
    text: "Perform your sign naturally while the app records your movement.",
  },
  {
    title: "Check the translation",
    text: "Review the word recognized by Beyond Words.",
  },
];

function HandIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M24 36V14a3 3 0 016 0v16M30 30V9a3 3 0 016 0v21M36 30V12a3 3 0 016 0v24M42 34v-8a3 3 0 016 0v14c0 11-8 18-18 18-8 0-13-4-17-11l-6-10a3 3 0 015-3l8 8" />
    </svg>
  );
}

export default function App() {
  const s = useSignRecorder();
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const startRecording = () => {
    setConfirmed(null);
    s.record();
  };

  const confirm = () => {
    if (s.word) {
      setConfirmed(s.word);
      speak(s.word);
    }

    s.reset();
  };

  const retry = () => {
    s.reset();
    startRecording();
  };

  const getStatusText = () => {
    switch (s.phase) {
      case "loading":
        return "Loading hand tracker...";
      case "idle":
        return "Ready to start";
      case "ready":
        return s.hands > 0
          ? `${s.hands} hand${s.hands === 1 ? "" : "s"} detected`
          : "Position your hands in the frame";
      case "recording":
        return "Recording your sign...";
      case "predicting":
        return "Recognizing sign...";
      case "result":
        return "Translation ready";
      default:
        return "Ready";
    }
  };

  const cameraOff = s.phase === "idle" || s.phase === "loading";
  const isLive = s.phase === "ready" || s.phase === "recording";

  return (
    <main className="app">
      {/* HERO */}
      <header className="hero">
        <div className="hero-title-row">
          <div className="wave-badge">
            <HandIcon />
          </div>
          <h1>
            Beyond <span className="word">Words</span>
          </h1>
        </div>

        <p className="hero-subtitle">
          <strong>Sign naturally. Be understood instantly.</strong> Helping
          people who use sign language communicate with those who don’t, by
          turning recognized signs into speech.
        </p>
      </header>

      {/* STEPS */}
      <ol className="instructions">
        {STEPS.map((step) => (
          <li key={step.title} className="instruction">
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>

      {/* STUDIO */}
      <section className="studio">
        {/* CAMERA */}
        <div className={`camera-container ${cameraOff ? "idle" : ""}`}>
          <video ref={s.videoRef} muted playsInline />
          <canvas ref={s.canvasRef} />

          {cameraOff && (
            <div className="camera-hint">
              <div className="hands">
                <i>
                  <HandIcon />
                </i>
                <i>
                  <HandIcon />
                </i>
              </div>
              <span>Your hands go here</span>
            </div>
          )}

          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
        </div>

        <div className="side">
          {/* TRANSLATION BUBBLE */}
          <div className="bubble" aria-live="polite">
            <small>{confirmed ? "You signed (spoken aloud)" : "You signed"}</small>

            <output className={`result-word ${confirmed ? "" : "empty"}`}>
              {confirmed
                ? [...confirmed].map((ch, i) => (
                    <span
                      key={`${confirmed}-${i}`}
                      style={{ "--i": i } as CSSProperties}
                    >
                      {ch === " " ? "\u00a0" : ch}
                    </span>
                  ))
                : "…"}
            </output>
          </div>

          {/* CONTROLS */}
          <div className="controls">
            <div className={`status ${isLive ? "live" : ""}`}>
              <span className="status-dot" />
              <span>{getStatusText()}</span>
            </div>

            {/* RECORDING PROGRESS */}
            {s.phase === "recording" && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            )}

            {/* START CAMERA */}
            {s.phase === "idle" && (
              <Button className="primary-button" onClick={s.startCamera}>
                Start Camera
              </Button>
            )}

            {/* RECORD */}
            {s.phase === "ready" && (
              <Button
                className="sign-button"
                disabled={!s.hands}
                onClick={startRecording}
              >
                Recognize Sign
              </Button>
            )}

            {/* RECORDING */}
            {s.phase === "recording" && (
              <Button className="sign-button" disabled>
                Recording...
              </Button>
            )}

            {/* PREDICTING */}
            {s.phase === "predicting" && (
              <Button className="sign-button" disabled>
                Recognizing...
              </Button>
            )}

            {/* REPLAY SPEECH */}
            {confirmed && (s.phase === "idle" || s.phase === "ready") && (
              <Button
                className="secondary-button"
                onClick={() => speak(confirmed)}
              >
                Say it again
              </Button>
            )}

            {/* ERROR */}
            {s.error && <div className="error-message">{s.error}</div>}
          </div>
        </div>
      </section>

      {/* KEEP TEAMMATE'S CONFIRMATION DIALOG */}
      <ConfirmWordDialog
        open={s.phase === "result"}
        word={s.word}
        onConfirm={confirm}
        onRetry={retry}
        onDismiss={s.reset}
      />

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 Beyond Words. All rights reserved.</p>

        <p className="footer-team">
          Made by <span>Mariam</span>, <span>Puspita</span>, <span>Andy</span>{" "}
          &amp; <span>Chris</span>
        </p>
      </footer>
    </main>
  );
}