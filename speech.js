const SDK = window.SpeechSDK;
if (!SDK)
    console.warn("Azure Speech SDK not found. Make sure the script is loaded in index.html.");
// ===================== Token Initialization =====================
let speechConfig = null;
let ttsSynth = null;
/**
 * Fetch short-lived Azure Speech token from backend
 */
async function getAzureSpeechToken() {
    const res = await fetch("/api/SpeechToken");
    if (!res.ok)
        throw new Error("Failed to get speech token");
    return res.json();
}
/**
 * Initialize SDK configs using token
 */
export async function initSpeechSDK() {
    if (!SDK)
        throw new Error("Speech SDK not loaded");
    const { token, region } = await getAzureSpeechToken();
    // Recognition config
    speechConfig = SDK.SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = "en-US";
    // TTS config
    const ttsConfig = SDK.SpeechConfig.fromAuthorizationToken(token, region);
    ttsConfig.speechSynthesisVoiceName = "en-GB-AbbiNeural";
    ttsSynth = new SDK.SpeechSynthesizer(ttsConfig);
}
// ===================== Speech-to-Text (STT) =====================
export async function recognizeSpeech() {
    if (!SDK || !speechConfig)
        throw new Error("Speech SDK not initialized");
    return new Promise((resolve, reject) => {
        try {
            const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);
            recognizer.recognizeOnceAsync((result) => {
                const text = result?.text || "";
                resolve(text);
                try {
                    recognizer.close();
                }
                catch { }
            }, (err) => {
                reject(err);
                try {
                    recognizer.close();
                }
                catch { }
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
// ===================== Text-to-Speech (TTS) =====================
export async function speakText(text) {
    if (!SDK || !ttsSynth)
        throw new Error("TTS SDK not initialized");
    return new Promise((resolve, reject) => {
        try {
            ttsSynth.speakTextAsync(text, () => resolve(), (err) => reject(err));
        }
        catch (err) {
            reject(err);
        }
    });
}
