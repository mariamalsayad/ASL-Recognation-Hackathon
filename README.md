# Beyond Words



<img width="917" height="727" alt="Screenshot 2026-10-15 at 10 04 34 PM" src="https://github.com/user-attachments/assets/b68bb7cc-be09-4b38-97a2-7a441157c4e9" />

<img width="891" height="639" alt="Screenshot 2026-10-15 at 10 04 48 PM" src="https://github.com/user-attachments/assets/41e95dd5-ae78-4f6f-8c2f-b57dd7099ae4" />
<img width="1463" height="1075" alt="Hello in the speech recognition screenshot" src="https://github.com/user-attachments/assets/e1ce3122-7805-4184-8b8e-135e6723b1fa" />
<img width="1426" height="1103" alt="Hello in a speech recognition interface" src="https://github.com/user-attachments/assets/3f99fb74-c0db-4cc5-81e5-901e501c0821" />







A web application that turns supported American Sign Language (ASL) signs into spoken audio. Built by a team of four during StormHacks at Simon Fraser University.

## How It Works

1. Start the webcam and click **Recognize Sign**.
2. Perform a supported sign during the two-second recording.
3. Review the predicted word and choose **Confirm**, **Try Again**, or **Cancel**.
4. Confirm the word to hear it spoken through ElevenLabs.

## Current Capabilities

The prototype uses a **very small training dataset** and currently supports three signs:

- **Hello**
- **Hungry**
- **How**

Recognition is limited to this vocabulary and may vary with the signer, lighting, and hand position. It does not translate full ASL sentences.

The complete recognition and speech flow works locally. The frontend is published at [beyond-words.tech](https://beyond-words.tech), while public backend deployment is in progress.

## Technology

- **Frontend:** React, TypeScript, and Vite
- **Hand tracking:** MediaPipe Hands
- **Backend:** Python and FastAPI
- **Recognition:** scikit-learn Random Forest model, saved with joblib
- **Speech:** ElevenLabs API

MediaPipe extracts hand landmarks from the webcam recording. The frontend sends a sequence of 30 frames, with 126 values per frame, to the backend for classification. The user confirms the prediction before speech is generated.

## Next Steps

- Expand the training dataset with more signs, examples, and signers.
- Evaluate recognition across different users and recording conditions.
- Deploy the backend so recognition and speech work through the public website.

## Deploy the public backend on Render

The repository includes `render.yaml` for a Render web service. The backend runs
on Render, so visitors do not need Python or a running server on their laptops.

1. Push these deployment files to your GitHub repository.
2. Open [Render's new Blueprint page](https://dashboard.render.com/select-repo?type=blueprint),
   connect `mariamalsayad/ASL-Recognation-Hackathon`, and select the branch containing
   `render.yaml`. Keep the repository root as the working directory: the backend
   needs the `asl_model.joblib` file at the root.
3. Enter `ELEVENLABS_API_KEY` in Render's secret environment field. Never put this
   key in frontend variables or commit it. Recognition works without the key;
   speech falls back to the browser voice if the speech API fails.
4. Deploy and copy the HTTPS service URL shown by Render. Open
   `https://YOUR-SERVICE.onrender.com/health` and check for `{"status":"ok"}`.
5. Set `VITE_API_URL=https://YOUR-SERVICE.onrender.com` in the environment used
   to build the frontend. For a manual local build, set it in `.env.production.local`.
   Run `npm run build` and publish the resulting `dist` folder through your existing
   frontend hosting process. Vite embeds this URL at build time, so changing it
   requires rebuilding and publishing the website.
6. Test **Start Camera → Recognize Sign → Confirm** on `https://beyond-words.tech`
   from a second laptop. Allow camera access. No localhost backend is needed.

`CORS_ORIGINS` on Render lists allowed frontend origins, separated by commas.
Update it if you change your frontend domain. The health endpoint confirms that
the server and model loaded; it does not test the ElevenLabs account.

The Blueprint selects Render's free plan; consult
[Render's free service limits](https://render.com/docs/free) for availability and
idle spin-down behavior. Initial requests after inactivity can take longer.

### Run the backend locally

Use Python 3.13. From the repository root:

```sh
python3 -m venv backend/.venv
# macOS / Linux:
source backend/.venv/bin/activate
# Windows PowerShell instead:
# backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Copy `backend/.env.example` to `backend/.env` to configure local speech.
The dependency versions match the environment that successfully loaded the
checked-in model; keep scikit-learn aligned with the model when retraining.
