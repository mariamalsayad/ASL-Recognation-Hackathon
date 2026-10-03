const video = document.getElementById("webcam");
const startButton = document.getElementById("start-camera");
const statusText = document.getElementById("status");

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

        statusText.textContent = "Camera is working!";
    } catch (error) {
        statusText.textContent = "Could not open camera: " + error.message;
        startButton.disabled = false;
        console.error(error);
    }
}

startButton.addEventListener("click", startCamera);