/** Sender type for messages */
export type MessageSender = "user" | "ai";

/** Database row for a conversation */
export interface Conversation {
  id: string;
  created_at: string;
  metadata: string | null;
}

/** Database row for a message */
export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  text: string;
  created_at: string;
}

/** Database row for FAQ entries */
export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
}

/** Request body for POST /chat/message */
export interface ChatMessageRequest {
  message: string;
  sessionId?: string;
}

/** Response body for POST /chat/message */
export interface ChatMessageResponse {
  reply: string;
  sessionId: string;
}

/** Response body for GET /chat/:sessionId/history */
export interface ChatHistoryResponse {
  sessionId: string;
  messages: Message[];
}

/** Standard error response */
export interface ErrorResponse {
  error: string;
}
