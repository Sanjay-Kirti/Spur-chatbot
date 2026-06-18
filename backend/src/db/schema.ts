import type Database from "better-sqlite3";

/**
 * Run database migrations (idempotent).
 * Creates all tables if they don't exist.
 */
export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id);
    
    CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(conversation_id, created_at);

    CREATE TABLE IF NOT EXISTS faq_entries (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    );
  `);

  console.log("✅ Database migrations complete.");
}
