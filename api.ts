// TypeScript type for backend response (PascalCase)
interface AICSResponse {
  Message: string;
  ConversationId: string;
  ThreadId: string;
}

let conversationId: string = ""; //localStorage.getItem("conversationId") || "";
let threadId: string = localStorage.getItem("threadId") || "";

const USER_ID = "d744a18a-abca-f011-8544-7c1e522e1702";
//const API_URL = "https://localhost:7046/api/AICS/message"; // your endpoint
const API_URL = "https://aics-fahbamdcfpase8dd.canadacentral-01.azurewebsites.net/api/AICS/message";
//               https://localhost:7046

/**
 * Send a message to the AI backend (JSON-only)
 */
export async function sendMessage(message: string): Promise<string> {
  const payload = {
    Message: message,
    ConversationId: conversationId,
    UserId: USER_ID,
    ThreadId: threadId
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  const data: AICSResponse = await response.json();

  // Update conversation/thread IDs if returned
  if (data.ConversationId) {
    conversationId = data.ConversationId;
    localStorage.setItem("conversationId", conversationId);
  }

  if (data.ThreadId) {
    threadId = data.ThreadId;
    localStorage.setItem("threadId", threadId);
  }

  return data.Message || "";
}

/**
 * Optional: reset conversation and thread
 */
export function resetConversation() {
  conversationId = "";
  threadId = "";
  localStorage.removeItem("conversationId");
  localStorage.removeItem("threadId");
}
