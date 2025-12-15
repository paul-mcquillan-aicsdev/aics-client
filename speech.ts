// NOTE: this file expects the Azure Speech SDK to be available globally at window.SpeechSDK
declare const SpeechSDK: any;
const SDK = (window as any).SpeechSDK || (window as any).SpeechSDK || (window as any).speechSDK || SpeechSDK;

if (!SDK) {
  console.warn("Azure Speech SDK not found. Make sure the script is loaded in index.html.");
}

// Configure these with your Azure Speech key + region
const AZURE_SPEECH_KEY = "YOUR_AZURE_KEY";
const AZURE_SPEECH_REGION = "YOUR_AZURE_REGION";

// Speech recognition config
const speechConfig = SDK ? SDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION) : null;
if (speechConfig) speechConfig.speechRecognitionLanguage = "en-US";

// TTS config — reuse or create new SpeechConfig
const ttsConfig = SDK ? SDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION) : null;
if (ttsConfig) ttsConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

// Create synthesizer once (re-usable)
const ttsSynth = SDK && ttsConfig ? new SDK.SpeechSynthesizer(ttsConfig) : null;

/**
 * recognizeSpeech
 * - Starts a single-shot speech recognition from the default microphone.
 * - Must be called from a user gesture (button click) on Safari/iOS to grant mic permission.
 */
export function recognizeSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!SDK || !speechConfig) return reject(new Error("Speech SDK not available"));

    try {
      const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);

      // Single-shot recognition
      recognizer.recognizeOnceAsync((result: any) => {
        // result.reason could be NoMatch/RecognizedSpeech etc. We'll return text if present.
        const text = result && result.text ? result.text : "";
        resolve(text);
        try { recognizer.close(); } catch {}
      }, (err: any) => {
        reject(err);
        try { recognizer.close(); } catch {}
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * speakText
 * - Synchronously returns a Promise that resolves when TTS completes or rejects on error.
 * - On Safari/iOS, initiating playback in direct response to a user gesture is most reliable.
 */
export function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!SDK || !ttsSynth) return reject(new Error("Speech SDK or TTS not available"));

    try {
      ttsSynth.speakTextAsync(
        text,
        () => {
          resolve();
        },
        (err: any) => {
          console.error("TTS error", err);
          reject(err);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}
