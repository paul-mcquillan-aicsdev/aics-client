let recognizer = null;
let synthesizer = null;
let listening = false;
let lastSpeechTime = 0;
let silenceTimer = null;
const SILENCE_TIMEOUT_MS = 60000;
/* ===== TOKEN FETCH ===== */
const BACKEND_URL = "https://aics-fahbamdcfpase8dd.canadacentral-01.azurewebsites.net";
async function getAzureSpeechToken() {
    const res = await fetch(`${BACKEND_URL}/api/SpeechToken`);
    if (!res.ok)
        throw new Error("Failed to fetch speech token");
    return res.json();
}
/* ===== LISTEN ===== */
export async function startListening(onPartial, onFinal, onStopped) {
    if (listening)
        return;
    listening = true;
    stopSpeaking(); // 🔇 interrupt TTS
    const { token, region } = await getAzureSpeechToken();
    const config = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
    config.speechRecognitionLanguage = "en-US";
    const audio = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.SpeechRecognizer(config, audio);
    recognizer.recognizing = (_, e) => {
        if (e.result?.text) {
            lastSpeechTime = Date.now();
            onPartial(e.result.text);
        }
    };
    recognizer.recognized = (_, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            lastSpeechTime = Date.now();
            onFinal(e.result.text.trim());
        }
    };
    recognizer.startContinuousRecognitionAsync();
    lastSpeechTime = Date.now();
    silenceTimer = window.setInterval(() => {
        if (Date.now() - lastSpeechTime > SILENCE_TIMEOUT_MS) {
            stopListening();
            onStopped();
        }
    }, 1000);
}
export function stopListening() {
    if (!recognizer)
        return;
    recognizer.stopContinuousRecognitionAsync(() => {
        recognizer.close();
        recognizer = null;
        listening = false;
        if (silenceTimer)
            clearInterval(silenceTimer);
    });
}
export function isListening() {
    return listening;
}
/* ===== SPEAK ===== */
export async function speak(text) {
    const { token, region } = await getAzureSpeechToken();
    const config = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
    config.speechSynthesisVoiceName = "en-GB-AbbiNeural";
    synthesizer = new SpeechSDK.SpeechSynthesizer(config);
    synthesizer.speakTextAsync(text);
}
export function stopSpeaking() {
    if (synthesizer) {
        synthesizer.close();
        synthesizer = null;
    }
}
