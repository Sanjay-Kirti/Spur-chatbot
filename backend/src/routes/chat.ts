import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { validateBody, chatMessageSchema } from "../middleware/validation.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  createConversation,
  conversationExists,
} from "../models/conversation.js";
import {
  createMessage,
  getMessagesByConversation,
  getRecentMessages,
} from "../models/message.js";
import { generateReply } from "../services/llm.js";
import { config } from "../config.js";
import type {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatHistoryResponse,
} from "../types.js";

export const chatRouter = Router();

/**
 * POST /chat/message
 *
 * Accept a user message, persist it, generate an AI reply via LLM,
 * persist the reply, and return both the reply and session ID.
 */
chatRouter.post(
  "/message",
  validateBody(chatMessageSchema),
  async (req, res, next) => {
    try {
      const { message, sessionId } = req.body as ChatMessageRequest;

      let currentSessionId: string;

      // Resolve or create conversation
      if (sessionId) {
        if (!conversationExists(sessionId)) {
          throw new AppError(
            "Conversation not found. Please start a new chat.",
            404
          );
        }
        currentSessionId = sessionId;
      } else {
        const conversation = createConversation(uuidv4(), {
          channel: "web",
          startedAt: new Date().toISOString(),
        });
        currentSessionId = conversation.id;
      }

      // Persist the user's message
      createMessage({
        conversationId: currentSessionId,
        sender: "user",
        text: message,
      });

      // Fetch recent conversation history for LLM context
      const history = getRecentMessages(
        currentSessionId,
        config.MAX_HISTORY_MESSAGES
      );

      // Generate AI reply (the current user message is already in history
      // since we just persisted it, but we pass it separately so the LLM
      // service can structure the prompt correctly)
      // We pass history WITHOUT the current message (already in the list)
      // and the user message separately.
      const historyWithoutCurrent = history.slice(0, -1);
      const reply = await generateReply(historyWithoutCurrent, message);

      // Persist the AI reply
      createMessage({
        conversationId: currentSessionId,
        sender: "ai",
        text: reply,
      });

      const response: ChatMessageResponse = {
        reply,
        sessionId: currentSessionId,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /chat/:sessionId/history
 *
 * Fetch the full message history for a conversation.
 * Used to restore chat state on page reload.
 */
chatRouter.get("/:sessionId/history", (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !conversationExists(sessionId)) {
      throw new AppError("Conversation not found.", 404);
    }

    const messages = getMessagesByConversation(sessionId);

    const response: ChatHistoryResponse = {
      sessionId,
      messages,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});
