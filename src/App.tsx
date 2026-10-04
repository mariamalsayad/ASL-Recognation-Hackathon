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
    s.reset(); // closes the dialog
  };

  const retry = () => {
    s.reset();
    startRecording(); // straight into another 2-second recording
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <video ref={s.videoRef} muted playsInline className="absolute inset-0 size-full -scale-x-100 object-cover" />
        <canvas ref={s.canvasRef} className="absolute inset-0 size-full -scale-x-100 object-cover" />
      </div>

      <p>Status: {s.phase} | Hands: {s.hands}</p>
      {s.error && <p className="text-red-500">{s.error}</p>}

      {s.phase === "idle" && <Button onClick={s.startCamera}>Start camera</Button>}
      {s.phase === "ready" && <Button disabled={!s.hands} onClick={s.record}>Record sign</Button>}
      {s.phase === "result" && <Button onClick={() => s.word && speak(s.word)}>Speak it</Button>}

      {s.word && <p className="text-4xl font-bold">{s.word}</p>}

      {confirmed && <p className="text-4xl font-bold">{confirmed}</p>}

      <ConfirmWordDialog
        open={s.phase === "result"}
        word={s.word}
        onConfirm={confirm}
        onRetry={retry}
        onDismiss={s.reset}
      />

    </div>
  );
}

