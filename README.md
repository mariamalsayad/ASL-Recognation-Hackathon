# Beyond Words



<img width="919" height="702" alt="Screenshot 2026-10-09 at 10 20 41 PM" src="https://github.com/user-attachments/assets/72e59f96-d257-4aaf-95b7-921a9135c613" />

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
