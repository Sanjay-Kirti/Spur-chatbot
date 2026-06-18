/** Sender type for messages */
export type MessageSender = "user" | "ai";

/** A chat message */
export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  text: string;
  created_at: string;
}

/** Response from POST /chat/message */
export interface ChatMessageResponse {
  reply: string;
  sessionId: string;
}

/** Response from GET /chat/:sessionId/history */
export interface ChatHistoryResponse {
  sessionId: string;
  messages: Message[];
}

/** API error response */
export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}
