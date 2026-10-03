import {
    HandLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs";

const video = document.getElementById("webcam");
const startButton = document.getElementById("start-camera");
const statusText = document.getElementById("status");
const canvas = document.getElementById("hand-overlay");
const context = canvas.getContext("2d");
const drawing = new DrawingUtils(context);

let handTracker;
let lastVideoTime = -1;

// Load the hand-tracking model.
async function loadHandTracker() {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
        );

        handTracker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
            },
            runningMode: "VIDEO",
            numHands: 2
        });

        startButton.disabled = false;
        startButton.textContent = "Start Camera";
        statusText.textContent = "Hand tracker ready. Start the camera!";
    } catch (error) {
        statusText.textContent = "Tracker failed to load: " + error.message;
        console.error(error);
    }
}

// Open the webcam.
async function startCamera() {
    startButton.disabled = true;
    statusText.textContent = "Waiting for camera access...";

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        trackHands();
    } catch (error) {
        statusText.textContent = "Could not start camera: " + error.message;
        video.srcObject?.getTracks().forEach(track => track.stop());
        startButton.disabled = false;
        console.error(error);
    }
}

// Detect hands and draw their points on every new frame.
function trackHands() {
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const results = handTracker.detectForVideo(
            video,
            performance.now()
        );

        context.clearRect(0, 0, canvas.width, canvas.height);

        for (const hand of results.landmarks) {
            drawing.drawConnectors(
                hand,
                HandLandmarker.HAND_CONNECTIONS,
                { color: "#00FF88", lineWidth: 3 }
            );

            drawing.drawLandmarks(hand, {
                color: "#FF3366",
                radius: 4
            });
        }

        statusText.textContent = results.landmarks.length > 0
            ? `Tracking ${results.landmarks.length} hand(s)!`
            : "Show your hands to the camera.";
    }

    requestAnimationFrame(trackHands);
}

startButton.addEventListener("click", startCamera);
loadHandTracker();