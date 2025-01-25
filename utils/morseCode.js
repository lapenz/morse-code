export const morseCodeMap = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", "1": ".----", "2": "..---", "3": "...--",
    "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..",
    "9": "----.", "0": "-----", " ": "/"
};

export const textToMorse = (text) =>
    text
        .toUpperCase()
        .split("")
        .map((char) => morseCodeMap[char] || "")
        .join(" ");

const targetFrequency = 900;  // Frequency of the Morse code tone (Hz)
const dotDuration = 150;  // Dot duration in milliseconds
const dotThreshold = dotDuration * 1.8;
const dashDuration = dotDuration * 3;  // Dash duration (3x dot duration)
const symbolPause = dotDuration;  // Pause between dots/dashes
const symbolPauseThreshold = symbolPause * 1.8;
const letterPause = dotDuration * 3;  // Pause between letters
const wordPause = dotDuration * 7;  // Pause between words
const wordPauseThreshold = wordPause * 0.8;

// Function to create a beep sound
function playTone(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine"; // Type of wave (sine, square, etc.)
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // Frequency of the beep (Hz)
    oscillator.start();

    // Stop the tone after the specified duration
    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

// Function to play Morse code
export const playMorseCode = (morseCode) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Explicitly resume the audio context on Safari
    audioContext.resume().then(() => {

        let currentTime = 0;

        // Iterate through each symbol in the morse code
        morseCode.split('').forEach((symbol) => {
            let duration = 0;

            if (symbol === '.') {
                duration = dotDuration;
                setTimeout(() => playTone(audioContext, targetFrequency, duration), currentTime); // Play dot
            } else if (symbol === '-') {
                duration = dashDuration;
                setTimeout(() => playTone(audioContext, targetFrequency, duration), currentTime); // Play dash
            } else if (symbol === ' ') {
                // Handle letter pause (pause between symbols of a letter)
                currentTime += letterPause;
            } else if (symbol === '/') {
                // Handle word pause (pause between words)
                currentTime += wordPause;
            }

            // Wait for the required time before the next symbol
            currentTime += duration + symbolPause;
        });
    });
};


const reverseMorseCodeMap = Object.fromEntries(
    Object.entries(morseCodeMap).map(([key, value]) => [value, key])
);

let isListening = false;

export const startListening = (onDecodedCallback) => {
    if (isListening) return;

    isListening = true;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;  // Size of the frequency data (controls accuracy)
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const frequencyThreshold = 0.78;  // Minimum magnitude to detect tone

    let isTone = false;
    let currentSymbol = "";
    let decodedMessage = "";
    let morseCodeMessage = "";
    let toneStartTime = null;
    let lastTime = performance.now();
    let microphone = null;

    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then((stream) => {
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            const listen = () => {
                if (!isListening) {
                    // Stop listening and clean up
                    audioContext.close();
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                analyser.getByteFrequencyData(dataArray);

                const targetIndex = Math.round((targetFrequency / audioContext.sampleRate) * analyser.fftSize);
                const magnitude = dataArray[targetIndex] / 255;  // Normalize magnitude

                const now = performance.now();

                if (magnitude > frequencyThreshold) {
                    // Tone detected
                    if (!isTone) {
                        toneStartTime = now;
                        isTone = true;
                    }
                } else if (isTone) {
                    // Tone ended
                    const toneDuration = now - toneStartTime;

                    if (toneDuration < dotThreshold) {
                        currentSymbol += ".";
                    } else {
                        currentSymbol += "-";
                    }

                    isTone = false;
                    lastTime = now;
                } else {
                    // Pause detection
                    const pauseDuration = now - lastTime;

                    if (pauseDuration > symbolPauseThreshold && currentSymbol) {
                        // Decode the current symbol
                        const decodedChar = reverseMorseCodeMap[currentSymbol.trim()] || "";
                        decodedMessage += decodedChar;
                        morseCodeMessage += currentSymbol + " ";
                        currentSymbol = "";
                    }

                    if (pauseDuration > wordPauseThreshold && decodedMessage.trim().length > 0) {
                        // Add space for a new word if we are between two valid words
                        if (!decodedMessage.endsWith(" ")) {
                            decodedMessage += " ";
                            morseCodeMessage += "/ ";
                        }
                    }

                    // Callback with updated message
                    onDecodedCallback(decodedMessage.trim(), morseCodeMessage.trim());
                }

                requestAnimationFrame(listen);
            };

            listen();
        })
        .catch((error) => {
            console.error("Error accessing microphone:", error);
        });
};

export const stopListening = () => {
    isListening = false;
};
