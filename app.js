import { sendMessage } from "./api.js";
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatLog = document.getElementById("chatLog");
// Profile icons (placeholder URLs)
const userIcon = "./images/user.svg";
const aiIcon = "./images/ai.svg";
let typingDiv = null;
let typingTimer = null;
/**
 * Append a message to chat log
 */
function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}-msg`;
    const icon = document.createElement("img");
    icon.className = "profile-icon";
    icon.src = sender === "user" ? userIcon : aiIcon;
    const content = document.createElement("div");
    content.className = "msg-content";
    const msgText = document.createElement("div");
    msgText.textContent = text;
    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    content.appendChild(msgText);
    content.appendChild(timestamp);
    msgDiv.appendChild(icon);
    msgDiv.appendChild(content);
    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}
// Send button click
sendBtn.addEventListener("click", async () => {
    const message = messageInput.value.trim();
    if (!message)
        return;
    // CLEAR INPUT IMMEDIATELY
    messageInput.value = "";
    messageInput.focus();
    sendBtn.disabled = true;
    appendMessage(message, "user");
    try {
        // ⏳ Schedule typing indicator after 3 seconds
        typingTimer = window.setTimeout(() => {
            showTypingIndicator();
        }, 3000);
        const reply = await sendMessage(message);
        hideTypingIndicator();
        appendMessage(reply, "ai");
        messageInput.value = "";
        messageInput.focus();
    }
    catch (err) {
        hideTypingIndicator();
        console.error(err);
        appendMessage("Error sending message: " + err.message, "ai");
    }
    finally {
        sendBtn.disabled = false;
    }
});
// Enter key sends message
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});
function showTypingIndicator() {
    if (typingDiv)
        return;
    typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.innerHTML = `
    <span>AI is typing</span>
    <span class="typing-dots">
      <span>.</span><span>.</span><span>.</span>
    </span>
  `;
    chatLog.appendChild(typingDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}
function hideTypingIndicator() {
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    if (typingDiv) {
        typingDiv.remove();
        typingDiv = null;
    }
}
