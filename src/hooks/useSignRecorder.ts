import { useEffect, useRef, useState } from "react";
import { DrawingUtils, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { predictSign, type Frame } from "@/lib/api";

// Same settings as camera.js, so recordings match what the model was trained on.
const DURATION = 2000;
const INTERVAL = 1000 / 15;
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export type Phase = "loading" | "idle" | "ready" | "recording" | "predicting" | "result";

export function useSignRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracker = useRef<HandLandmarker | null>(null);
  const raf = useRef(0);
  const rec = useRef<{ start: number; last: number; frames: Frame[] } | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [hands, setHands] = useState(0);
  const [progress, setProgress] = useState(0);
  const [word, setWord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the hand model once; stop the camera when the page closes.
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM);
        const t = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL },
          runningMode: "VIDEO",
          numHands: 2,
        });
        if (!dead) {
          tracker.current = t;
          setPhase("idle");
        }
      } catch {
        if (!dead) setError("The hand tracker didn't load. Check your internet connection and reload.");
      }
    })();
    const video = videoRef.current;
    return () => {
      dead = true;
      cancelAnimationFrame(raf.current);
      (video?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const finish = async () => {
    const frames = rec.current!.frames;
    rec.current = null;
    setProgress(0);
    if (!frames.some((f) => f.hands.length)) {
      setPhase("ready");
      setError("No hands were visible. Keep your hands in view while you sign, then try again.");
      return;
    }
    setPhase("predicting");
    try {
      setWord(await predictSign(frames));
      setPhase("result");
    } catch {
      setPhase("ready");
      setError("The backend didn't respond. Check that it's running on port 8000.");
    }
  };

  const loop = (draw: DrawingUtils, ctx: CanvasRenderingContext2D) => {
    let lastTime = -1;
    const tick = () => {
      const v = videoRef.current!;
      if (v.readyState >= 2 && v.currentTime !== lastTime) {
        lastTime = v.currentTime;
        const now = performance.now();
        const res = tracker.current!.detectForVideo(v, now);
        setHands((n) => (n === res.landmarks.length ? n : res.landmarks.length));

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (const h of res.landmarks) {
          draw.drawConnectors(h, HandLandmarker.HAND_CONNECTIONS, { color: "#5BD1C0", lineWidth: 3 });
          draw.drawLandmarks(h, { color: "#FFB020", radius: 4 });
        }

        const r = rec.current;
        if (r) {
          if (now - r.last >= INTERVAL) {
            r.last = now;
            r.frames.push({
              time: now - r.start,
              hands: res.landmarks.map((h, i) => ({
                handedness: res.handedness?.[i]?.[0]?.categoryName ?? "Unknown",
                landmarks: h.map(({ x, y, z }) => ({ x, y, z })),
              })),
            });
            setProgress(Math.min(100, ((now - r.start) / DURATION) * 100));
          }
          if (now - r.start >= DURATION) finish();
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const startCamera = async () => {
    setError(null);
    try {
      const v = videoRef.current!;
      const c = canvasRef.current!;
      v.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      await v.play();
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext("2d")!;
      setPhase("ready");
      loop(new DrawingUtils(ctx), ctx);
    } catch {
      setError("Camera access was blocked. Allow the camera in your browser's address bar, then try again.");
    }
  };

  const record = () => {
    setError(null);
    setWord(null);
    rec.current = { start: performance.now(), last: 0, frames: [] };
    setPhase("recording");
  };

  const reset = () => {
    setWord(null);
    setPhase("ready");
  };

  return { videoRef, canvasRef, phase, hands, progress, word, error, startCamera, record, reset };
}
