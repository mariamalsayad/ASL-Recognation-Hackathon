import {
    HandLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs";


// --------------------
// HTML ELEMENTS
// --------------------

const video = document.getElementById("webcam");
const startButton = document.getElementById("start-camera");
const statusText = document.getElementById("status");

const canvas = document.getElementById("hand-overlay");
const context = canvas.getContext("2d");
const drawing = new DrawingUtils(context);

const signLabel = document.getElementById("sign-label");
const recordButton = document.getElementById("record-sample");
const downloadButton = document.getElementById("download-data");
const sampleCount = document.getElementById("sample-count");


// --------------------
// VARIABLES
// --------------------

let handTracker;
let lastVideoTime = -1;

let trainingData = [];

let isRecording = false;
let currentRecording = [];

let recordingStartTime = 0;
let lastRecordedFrameTime = 0;

let handVisible = false;


// Record for 2 seconds.
const RECORDING_DURATION = 2000;

// Save about 15 frames every second.
const FRAME_INTERVAL = 1000 / 15;


// --------------------
// LOAD MEDIAPIPE
// --------------------

async function loadHandTracker() {

    try {

        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
        );

        handTracker = await HandLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
                },

                runningMode: "VIDEO",

                // We need up to 2 hands for signs such as Baby.
                numHands: 2
            }
        );


        startButton.disabled = false;

        startButton.textContent = "Start Camera";

        statusText.textContent =
            "Hand tracker ready. Start the camera!";


    } catch (error) {

        statusText.textContent =
            "Tracker failed to load: " + error.message;

        console.error(error);
    }
}


// --------------------
// START CAMERA
// --------------------

async function startCamera() {

    startButton.disabled = true;

    statusText.textContent =
        "Waiting for camera access...";

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });


        video.srcObject = stream;

        await video.play();


        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;


        statusText.textContent =
            "Camera started. Show your hands!";


        trackHands();


    } catch (error) {

        statusText.textContent =
            "Could not start camera: " + error.message;

        video.srcObject
            ?.getTracks()
            .forEach(track => track.stop());


        startButton.disabled = false;

        console.error(error);
    }
}


// --------------------
// TURN MEDIAPIPE RESULT
// INTO DATA
// --------------------

function getFrameData(results) {

    return results.landmarks.map(
        (hand, index) => {

            return {

                handedness:
                    results.handedness?.[index]?.[0]?.categoryName
                    || "Unknown",

                landmarks: hand.map(point => ({
                    x: point.x,
                    y: point.y,
                    z: point.z
                }))
            };
        }
    );
}


// --------------------
// START RECORDING SIGN
// --------------------

function startRecording() {

    if (isRecording) {
        return;
    }


    currentRecording = [];

    isRecording = true;

    recordingStartTime = performance.now();

    lastRecordedFrameTime = 0;


    recordButton.disabled = true;

    recordButton.textContent =
        "Recording...";


    statusText.textContent =
        `Recording "${signLabel.value}" — perform the sign now!`;
}


// --------------------
// FINISH RECORDING SIGN
// --------------------

function finishRecording() {

    isRecording = false;


    if (currentRecording.length > 0) {

        const sample = {

            label: signLabel.value,

            frames: currentRecording
        };


        trainingData.push(sample);


        sampleCount.textContent =
            `Samples: ${trainingData.length}`;


        statusText.textContent =
            `Saved "${signLabel.value}"!`;


        console.log(
            "Saved recording:",
            sample
        );
    }


    currentRecording = [];


    recordButton.textContent =
        "Record Sign";


    recordButton.disabled =
        !handVisible;
}


// --------------------
// TRACK HANDS
// --------------------

function trackHands() {

    if (
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
    ) {

        lastVideoTime =
            video.currentTime;


        const results =
            handTracker.detectForVideo(
                video,
                performance.now()
            );


        handVisible =
            results.landmarks.length > 0;


        // Only enable Record Sign
        // when a hand is visible.
        if (!isRecording) {

            recordButton.disabled =
                !handVisible;
        }


        // --------------------
        // SAVE FRAMES WHILE
        // RECORDING
        // --------------------

        if (isRecording) {

            const now =
                performance.now();


            if (
                now - lastRecordedFrameTime
                >= FRAME_INTERVAL
            ) {

                const frameData =
                    getFrameData(results);


                currentRecording.push({
                    time:
                        now - recordingStartTime,

                    hands:
                        frameData
                });


                lastRecordedFrameTime =
                    now;
            }


            if (
                now - recordingStartTime
                >= RECORDING_DURATION
            ) {

                finishRecording();
            }
        }


        // --------------------
        // DRAW HAND SKELETON
        // --------------------

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        for (
            const hand of results.landmarks
        ) {

            drawing.drawConnectors(
                hand,
                HandLandmarker.HAND_CONNECTIONS,
                {
                    color: "#00FF88",
                    lineWidth: 3
                }
            );


            drawing.drawLandmarks(
                hand,
                {
                    color: "#FF3366",
                    radius: 4
                }
            );
        }


        if (!isRecording) {

            statusText.textContent =
                results.landmarks.length > 0
                    ? `Tracking ${results.landmarks.length} hand(s)!`
                    : "Show your hands to the camera.";
        }
    }


    requestAnimationFrame(
        trackHands
    );
}


// --------------------
// DOWNLOAD DATASET
// --------------------

function downloadDataset() {

    if (trainingData.length === 0) {

        statusText.textContent =
            "Record at least one sign first.";

        return;
    }


    const dataset = {

        createdAt:
            new Date().toISOString(),

        recordingDuration:
            RECORDING_DURATION,

        samples:
            trainingData
    };


    const jsonData =
        JSON.stringify(
            dataset,
            null,
            2
        );


    const blob =
        new Blob(
            [jsonData],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "asl-training-data.json";


    link.click();


    URL.revokeObjectURL(url);
}


// --------------------
// BUTTONS
// --------------------

startButton.addEventListener(
    "click",
    startCamera
);


recordButton.addEventListener(
    "click",
    startRecording
);


downloadButton.addEventListener(
    "click",
    downloadDataset
);


// Start loading MediaPipe
// when the webpage opens.
loadHandTracker();