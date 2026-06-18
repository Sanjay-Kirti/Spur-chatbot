import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { initDatabase, closeDatabase } from "./db/index.js";
import { seedFaqData, getAllFaqEntries } from "./db/seed.js";
import { chatRouter } from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "10kb" })); // Limit request body size

// --- Routes ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/chat", chatRouter);

// --- Error Handler (must be last) ---
app.use(errorHandler);

// --- Server Bootstrap ---
function startServer(): void {
  // Initialize database
  initDatabase();

  // Auto-seed FAQ data if the table is empty
  const existingFaqs = getAllFaqEntries();
  if (existingFaqs.length === 0) {
    seedFaqData();
  }

  app.listen(config.PORT, () => {
    console.log(`
🚀 Splur Backend Server
   ├─ Port:     ${config.PORT}
   ├─ Env:      ${config.NODE_ENV}
   ├─ Database: ${config.DATABASE_PATH}
   └─ Frontend: ${config.FRONTEND_URL}
    `);
  });
}

// --- Graceful Shutdown ---
function handleShutdown(signal: string): void {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  closeDatabase();
  process.exit(0);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

// Handle uncaught errors
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  closeDatabase();
  process.exit(1);
});

startServer();

export { app };
