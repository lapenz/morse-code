"use client"
import { SetStateAction, useState} from "react";
import {textToMorse, playMorseCode, startListening, stopListening} from "@/utils/morseCode";

export default function Home() {
    const [input, setInput] = useState("");
    const [morse, setMorse] = useState("");
    const [isListening, setIsListening] = useState(false);

    const handleConvert = () => {
        const morseCode = textToMorse(input);
        setMorse(morseCode);
    };

    const handlePlay = () => {
        playMorseCode(morse);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
            setIsListening(false);
        } else {
            setIsListening(true);
            startListening((decodedMessage: SetStateAction<string>, morseCode: SetStateAction<string>) => {
                setInput(decodedMessage);
                setMorse(morseCode)
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-semibold text-blue-600 mb-4">Morse Code Generator</h1>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                cols={50}
                placeholder="Type your text here..."
                className="resize-none p-4 border-2 border-gray-300 rounded-md shadow-md mb-4 text-black text-lg w-full max-w-xl"
            />

            <div className="space-x-4">
                <button
                    onClick={handleConvert}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
                >
                    Convert to Morse Code
                </button>
                <button
                    onClick={handlePlay}
                    className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition"
                    disabled={!morse}
                >
                    Play Morse Code
                </button>
                <button
                    onClick={toggleListening}
                    className={`px-6 py-3 ${
                        isListening ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                    } text-white rounded-md shadow-md transition`}
                >
                    {isListening ? "Stop Listening" : "Start Listening"}
                </button>
            </div>

            <h2 className="text-2xl text-black font-semibold mt-6">Morse Code Output:</h2>
            <pre className="bg-white text-lg text-black p-4 rounded-md border-2 border-gray-300 shadow-md max-w-xl w-full mt-4">
        {morse}
      </pre>
        </div>
    );
}
