const input = document.getElementById("speech-text");
const button = document.getElementById("speak-button");
const status = document.getElementById("speech-status");
const player = document.getElementById("speech-audio");

let audioUrl;

button.addEventListener("click", async () => {
    const text = input.value.trim();

    if (!text) {
        status.textContent = "Please enter a word or sentence.";
        return;
    }

    button.disabled = true;
    status.textContent = "Generating voice...";
    player.pause();

    try {
        const response = await fetch("http://127.0.0.1:8000/speak", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Speech generation failed.");
        }

        const audio = await response.blob();

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        audioUrl = URL.createObjectURL(audio);
        player.src = audioUrl;
        player.hidden = false;

        try {
            await player.play();
            status.textContent = "Audio ready!";
        } catch {
            status.textContent = "Audio ready—press Play below.";
        }
    } catch (error) {
        status.textContent = "Error: " + error.message;
    } finally {
        button.disabled = false;
    }
});