import { getDb } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";
import type { Conversation } from "../types.js";

/**
 * Create a new conversation record.
 */
export function createConversation(
  id?: string,
  metadata?: Record<string, unknown>
): Conversation {
  const db = getDb();
  const conversationId = id || uuidv4();
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  db.prepare(
    "INSERT INTO conversations (id, metadata) VALUES (?, ?)"
  ).run(conversationId, metadataJson);

  return getConversation(conversationId)!;
}

/**
 * Fetch a conversation by ID.
 */
export function getConversation(id: string): Conversation | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM conversations WHERE id = ?")
    .get(id) as Conversation | undefined;
}

/**
 * Check if a conversation exists.
 */
export function conversationExists(id: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT 1 FROM conversations WHERE id = ?")
    .get(id);
  return !!row;
}
