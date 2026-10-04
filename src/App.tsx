import { Button } from "@/components/ui/button";
import { useSignRecorder } from "@/hooks/useSignRecorder";
import { speak } from "@/lib/api";

export default function App() {
  const s = useSignRecorder(); 

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <video ref={s.videoRef} muted playsInline className="absolute inset-0 size-full -scale-x-100 object-cover" />
        <canvas ref={s.canvasRef} className="absolute inset-0 size-full -scale-x-100 object-cover" />
      </div>

      {/* Status and errors */}
      <p>Status: {s.phase} | Hands: {s.hands}</p>
      {s.error && <p className="text-red-500">{s.error}</p>}

      {/* Buttons, one per stage */}
      {s.phase === "idle" && <Button onClick={s.startCamera}>Start camera</Button>}
      {s.phase === "ready" && <Button disabled={!s.hands} onClick={s.record}>Record sign</Button>}
      {s.phase === "result" && <Button onClick={() => s.word && speak(s.word)}>Speak it</Button>}

      {/* The word the model predicted */}
      {s.word && <p className="text-4xl font-bold">{s.word}</p>}
    </div>
  );
}

