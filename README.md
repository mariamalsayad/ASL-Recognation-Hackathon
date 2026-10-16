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
