import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

/**
 * Schema for POST /chat/message request body.
 */
export const chatMessageSchema = z.object({
  message: z
    .string({
      required_error: "Message is required.",
      invalid_type_error: "Message must be a string.",
    })
    .min(1, "Message cannot be empty.")
    .max(
      config.MAX_MESSAGE_LENGTH,
      `Message is too long. Maximum ${config.MAX_MESSAGE_LENGTH} characters.`
    )
    .transform((val) => val.trim()),
  sessionId: z.string().uuid("Invalid session ID format.").optional(),
});

/**
 * Factory for creating Zod validation middleware.
 * Validates request body against the given schema and attaches
 * the parsed data to `req.body`.
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        error: "Validation failed.",
        details: errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
