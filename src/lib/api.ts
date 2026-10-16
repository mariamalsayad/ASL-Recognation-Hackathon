const API = (import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "")).replace(/\/+$/, "");

function apiUrl(path: string): string {
  if (!API) {
    throw new Error("Backend is not configured. Set VITE_API_URL to the public backend URL and rebuild the website.");
  }
  return `${API}${path}`;
}

export type Frame = {
  time: number;
  hands: { handedness: string; landmarks: { x: number; y: number; z: number }[] }[];
};

export async function predictSign(frames: Frame[]): Promise<string> {
  const r = await fetch(apiUrl("/predict"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frames }),
  });
  if (!r.ok) throw new Error(`Predict failed (${r.status})`);
  return String((await r.json()).prediction);
}

// Plays the ElevenLabs voice from /speak; falls back to the browser voice if that fails.
export async function speak(text: string): Promise<void> {
  try {
    const r = await fetch(apiUrl("/speak"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!r.ok) throw new Error("speak failed");
    const url = URL.createObjectURL(await r.blob());
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

