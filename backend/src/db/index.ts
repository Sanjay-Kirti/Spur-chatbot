import Database from "better-sqlite3";
import { config } from "../config.js";
import { runMigrations } from "./schema.js";
import path from "node:path";
import fs from "node:fs";

let db: Database.Database;

/**
 * Initialize the SQLite database connection.
 * Creates the data directory if it doesn't exist, enables WAL mode,
 * and runs migrations.
 */
export function initDatabase(): Database.Database {
  const dbDir = path.dirname(config.DATABASE_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(config.DATABASE_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Run schema migrations
  runMigrations(db);

  console.log(`✅ Database initialized at ${config.DATABASE_PATH}`);
  return db;
}

/**
 * Get the active database instance.
 * Throws if the database hasn't been initialized yet.
 */
export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Close the database connection gracefully.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    console.log("🔒 Database connection closed.");
  }
}
