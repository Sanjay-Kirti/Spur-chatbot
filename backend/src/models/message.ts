import { getDb } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";
import type { Message, MessageSender } from "../types.js";

interface CreateMessageParams {
  conversationId: string;
  sender: MessageSender;
  text: string;
}

/**
 * Insert a new message into the database.
 */
export function createMessage(params: CreateMessageParams): Message {
  const db = getDb();
  const id = uuidv4();

  db.prepare(
    "INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)"
  ).run(id, params.conversationId, params.sender, params.text);

  return db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(id) as Message;
}

/**
 * Fetch all messages for a conversation, ordered by creation time.
 */
export function getMessagesByConversation(conversationId: string): Message[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
    )
    .all(conversationId) as Message[];
}

/**
 * Fetch the most recent N messages for a conversation.
 * Used for building LLM context without exceeding token limits.
 */
export function getRecentMessages(
  conversationId: string,
  limit: number
): Message[] {
  const db = getDb();
  // Subquery to get last N, then re-sort ascending
  return db
    .prepare(
      `SELECT * FROM (
        SELECT * FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      ) ORDER BY created_at ASC`
    )
    .all(conversationId, limit) as Message[];
}
