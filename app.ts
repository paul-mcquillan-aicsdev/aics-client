import { sendMessage } from "./api.js";
import {
  startListening,
  stopListening,
  isListening,
  speak
} from "./speech.js";

/* =========================
   DOM ELEMENTS
========================= */

const chatLog = document.getElementById("chatLog") as HTMLElement;
const messageInput = document.getElementById("messageInput") as HTMLTextAreaElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
const talkBtn = document.getElementById("talkBtn") as HTMLButtonElement;
const typingIndicator = document.getElementById("typingIndicator") as HTMLElement;
const liveTranscript = document.getElementById("liveTranscript") as HTMLElement;

/* =========================
   INIT
========================= */

messageInput.focus();

/* =========================
   TEXT SEND (Keyboard)
========================= */

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  messageInput.value = ""; // clear immediately
  appendUserMessage(text);

  await handleAIResponse(text);
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

/* =========================
   VOICE TOGGLE
========================= */

talkBtn.addEventListener("click", async () => {
  if (!isListening()) {
    talkBtn.classList.add("active");
    talkBtn.textContent = "Listening…";
    liveTranscript.textContent = "";

    await startListening(
      // 📝 partial transcript
      (partialText: string) => {
        liveTranscript.textContent = partialText;
      },

      // ✅ final transcript
      async (finalText: string) => {
        if (!finalText) return;

        liveTranscript.textContent = "";
        appendUserMessage(finalText);

        await handleAIResponse(finalText);
      },

      // ⏹ auto-stop (silence)
      () => {
        resetTalkButton();
      }
    );
  } else {
    stopListening();
    resetTalkButton();
  }
});

/* =========================
   CORE AI HANDLER
========================= */

async function handleAIResponse(text: string) {
  showTyping(true);

  try {
    const reply = await sendMessage(text);

    showTyping(false);
    appendAIMessage(reply);

    // 🔊 Speak AFTER message is rendered
    await speak(reply);
  } catch (err) {
    console.error(err);
    showTyping(false);
    appendSystemMessage("Something went wrong.");
  }
}

/* =========================
   UI HELPERS
========================= */

function showTyping(show: boolean) {
  typingIndicator.classList.toggle("hidden", !show);
}

function resetTalkButton() {
  talkBtn.classList.remove("active");
  talkBtn.textContent = "Talk";
  liveTranscript.textContent = "";
}

/* =========================
   MESSAGE RENDERING
========================= */

function appendUserMessage(text: string) {
  appendMessage(text, "user-msg", "U");
}

function appendAIMessage(text: string) {
  appendMessage(text, "ai-msg", "AI");
}

function appendSystemMessage(text: string) {
  appendMessage(text, "system-msg", "!");
}

function appendMessage(text: string, cssClass: string, label: string) {
  const msg = document.createElement("div");
  msg.className = `message ${cssClass}`;

  const icon = document.createElement("img");
  icon.className = "profile-icon";
  icon.src =
    label === "U"
      ? "https://via.placeholder.com/28/1e8449/ffffff?text=U"
      : label === "AI"
      ? "https://via.placeholder.com/28/2874a6/ffffff?text=AI"
      : "https://via.placeholder.com/28/555/ffffff?text=!";

  const content = document.createElement("div");
  content.className = "msg-content";
  content.textContent = text;

  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  msg.appendChild(icon);
  msg.appendChild(content);
  msg.appendChild(timestamp);

  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}
