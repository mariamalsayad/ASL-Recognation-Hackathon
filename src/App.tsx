import { Button } from "@/components/ui/button";
import { useSignRecorder } from "@/hooks/useSignRecorder";
import { speak } from "@/lib/api";
import ConfirmWordDialog from "@/component/alertDialog";
import { useState } from "react";

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

  return (
    <main className="app">

      {/* HERO */}
      <header className="hero">
        <div className="logo">
          <span className="logo-dot"></span>
          SIGN • TRANSLATE • SPEAK
        </div>

        <h1>Beyond Words</h1>

        <p className="hero-subtitle">
          Sign naturally. <strong>Be understood instantly.</strong>
          <br />
         Helping people who use sign language communicate with those who don’t, by turning recognized signs into speech.
        </p>
      </header>

      {/* INSTRUCTIONS */}
    <section className="instructions">

  <article className="instruction">
    <span className="step-number">STEP 01</span>
    <h3>Start your camera</h3>
    <p>
      Allow camera access so Beyond Words can see your hands.
    </p>
  </article>

  <article className="instruction">
    <span className="step-number">STEP 02</span>
    <h3>Position your hands</h3>
    <p>
      Keep your hands clearly visible inside the camera frame.
    </p>
  </article>

  <article className="instruction">
    <span className="step-number">STEP 03</span>
    <h3>Click Recognize Sign</h3>
    <p>
      Click the Recognize Sign button when you are ready.
    </p>
  </article>

  <article className="instruction">
    <span className="step-number">STEP 04</span>
    <h3>Perform your sign</h3>
    <p>
      Perform your sign naturally while the app records your movement.
    </p>
  </article>

  <article className="instruction">
    <span className="step-number">STEP 05</span>
    <h3>Check the translation</h3>
    <p>
      Review the word recognized by Beyond Words.
    </p>
  </article>

</section>

      {/* CAMERA */}
      <section className="camera-section">

        <div className="camera-container">
          <video
            ref={s.videoRef}
            muted
            playsInline
          />

          <canvas ref={s.canvasRef} />
        </div>

        {/* STATUS */}
        <div className="status-row">

          <div className="status">
            <span className="status-dot"></span>

            <span>{getStatusText()}</span>

            {s.phase !== "idle" && s.phase !== "loading" && (
              <span>• Hands: {s.hands}</span>
            )}
          </div>

          {/* START CAMERA */}
          {s.phase === "idle" && (
            <Button
              className="primary-button"
              onClick={s.startCamera}
            >
              Start Camera
            </Button>
          )}

          {/* RECORD */}
          {s.phase === "ready" && (
            <Button
              className="primary-button"
              disabled={!s.hands}
              onClick={startRecording}
            >
              Recognize Sign
            </Button>
          )}

          {/* RECORDING */}
          {s.phase === "recording" && (
            <Button
              className="primary-button"
              disabled
            >
              Recording...
            </Button>
          )}

          {/* PREDICTING */}
          {s.phase === "predicting" && (
            <Button
              className="primary-button"
              disabled
            >
              Recognizing...
            </Button>
          )}

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

        {/* ERROR */}
        {s.error && (
          <div className="error-message">
            {s.error}
          </div>
        )}

        {/* CONFIRMED TRANSLATION */}
        {confirmed && (
          <div className="result-card">

            <p className="result-label">
              Translation
            </p>

            <h2 className="result-word">
              {confirmed}
            </h2>

            <p className="result-label">
              Spoken aloud ✓
            </p>

          </div>
        )}

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
    Made by <span>Mariam</span>, <span>Puspita</span>,{" "}
    <span>Andy</span> & <span>Chris</span>
  </p>
</footer>

    </main>
  );
}