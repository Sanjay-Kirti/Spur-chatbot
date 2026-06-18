import type { Request, Response, NextFunction } from "express";

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a clean JSON response.
 * Logs the full error server-side but only exposes safe messages to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the full error for debugging
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Handle JSON parse errors (malformed request body)
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON in request body." });
    return;
  }

  // Fallback for unexpected errors — don't leak internals
  res.status(500).json({
    error: "An unexpected error occurred. Please try again later.",
  });
}
