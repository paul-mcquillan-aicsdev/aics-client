// ===================== Imports =====================
import { sendMessage, resetConversation } from './api.js';
import { recognizeSpeech, speakText, initSpeechSDK } from './speech.js';
// ===================== DOM Elements =====================
const chatLog = document.getElementById("chatLog");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const resetBtn = document.getElementById("resetBtn");
const typingIndicator = document.getElementById("typingIndicator");
const voiceBtn = document.getElementById("voiceBtn");
// ===================== Helper Functions =====================
function createMessageBubble(msg) {
    const bubble = document.createElement("div");
    bubble.classList.add(msg.sender === "user" ? "user-msg" : "ai-msg");
    // Profile Icon
    const icon = document.createElement("span");
    icon.classList.add("profile-icon");
    icon.textContent = msg.sender === "user" ? "🧑" : "🤖";
    // Message content
    const content = document.createElement("div");
    content.classList.add("msg-content");
    content.textContent = msg.message;
    // Timestamp
    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");
    timestamp.textContent = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    content.appendChild(timestamp);
    bubble.appendChild(icon);
    bubble.appendChild(content);
    chatLog.appendChild(bubble);
    // Auto-scroll
    chatLog.scrollTop = chatLog.scrollHeight;
}
function showTypingIndicator(duration = 3000) {
    typingIndicator.classList.remove("hidden");
    setTimeout(() => typingIndicator.classList.add("hidden"), duration);
}
// ===================== Send Message =====================
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message)
        return;
    // Render user message
    createMessageBubble({ message, sender: "user", timestamp: new Date() });
    // Clear input
    messageInput.value = "";
    messageInput.focus();
    // Typing indicator
    showTypingIndicator();
    try {
        const aiResponse = await sendMessage(message);
        createMessageBubble({ message: aiResponse, sender: "ai", timestamp: new Date() });
        // Speak AI response
        try {
            await speakText(aiResponse);
        }
        catch (err) {
            console.error("TTS failed", err);
        }
    }
    catch (err) {
        console.error(err);
        createMessageBubble({ message: "Error sending message", sender: "ai", timestamp: new Date() });
    }
}
// ===================== Event Listeners =====================
sendBtn.addEventListener("click", handleSendMessage);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});
resetBtn.addEventListener("click", () => {
    resetConversation();
    chatLog.innerHTML = "";
    messageInput.focus();
});
if (voiceBtn) {
    voiceBtn.addEventListener("click", async () => {
        try {
            const userText = await recognizeSpeech(); // STT
            if (!userText)
                return;
            messageInput.value = userText;
            await handleSendMessage();
        }
        catch (err) {
            console.error("Voice recognition failed", err);
        }
    });
}
// ===================== Initialization =====================
(async () => {
    try {
        await initSpeechSDK(); // fetch token & init SDK
        console.log("Azure Speech SDK initialized successfully");
    }
    catch (err) {
        console.error("Failed to initialize Azure Speech SDK", err);
    }
    // Focus input on load
    messageInput.focus();
})();
