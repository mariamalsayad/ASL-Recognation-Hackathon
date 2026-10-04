import os
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import numpy as np
from joblib import load

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).parent / ".env")

app = FastAPI()

MODEL_PATH = Path(__file__).parent.parent / "asl_model.joblib"
model = load(MODEL_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173", "http://localhost:5173",
        "http://127.0.0.1:5500", "http://localhost:5500",
    ],
    allow_methods=["GET","POST"],
    allow_headers=["Content-Type"]
)

# A sample voice from ElevenLabs' documentation.
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)

class PredictRequest(BaseModel):
    frames: list


@app.get("/")
def home():
    return {"message": "Backend is working!"}

@app.post("/predict")
def predict(request: PredictRequest):

    frame_vectors = []

    for frame in request.frames:

        left_hand = np.zeros(63)
        right_hand = np.zeros(63)

        for hand in frame["hands"]:

            values = []

            for point in hand["landmarks"]:
                values.extend([
                    point["x"],
                    point["y"],
                    point["z"]
                ])

            hand_vector = np.array(values)

            if hand["handedness"] == "Left":
                left_hand = hand_vector

            elif hand["handedness"] == "Right":
                right_hand = hand_vector

        frame_vector = np.concatenate([
            left_hand,
            right_hand
        ])

        frame_vectors.append(frame_vector)

    if len(frame_vectors) == 0:
        raise HTTPException(
            status_code=400,
            detail="No hand frames received."
        )

    # Convert recording to exactly 30 frames,
    # matching how your teammate trained the model.
    indexes = np.linspace(
        0,
        len(frame_vectors) - 1,
        30
    ).astype(int)

    selected_frames = [
        frame_vectors[index]
        for index in indexes
    ]

    features = np.concatenate(selected_frames)

    prediction = model.predict([features])[0]

    return {"prediction": prediction}

@app.post("/speak")
async def speak(request: SpeechRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Please enter text.")

    api_key = os.getenv("ELEVENLABS_API_KEY")

    if not api_key:
        raise HTTPException(status_code=500, detail="API key is missing.")

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            result = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
                params={"output_format": "mp3_44100_128"},
                headers={
                    "xi-api-key": api_key,
                    "Accept": "audio/mpeg"
                },
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2"
                }
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to ElevenLabs."
        )

    if result.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"ElevenLabs error: {result.text}"
        )

    return Response(
        content=result.content,
        media_type="audio/mpeg",
        headers={"Content-Disposition": 'attachment; filename="speech.mp3"'}
    )