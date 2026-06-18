import type { ChatMessageResponse, ChatHistoryResponse, ApiError } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom error class for API errors with structured details.
 */
export class ChatApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: { field: string; message: string }[];

  constructor(message: string, statusCode: number, details?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ChatApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Send a chat message to the backend.
 * Returns the AI reply and session ID.
 */
export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<ChatMessageResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000); // 45s timeout

  try {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ApiError | null;
      throw new ChatApiError(
        errorBody?.error || `Request failed with status ${response.status}`,
        response.status,
        errorBody?.details
      );
    }

    return (await response.json()) as ChatMessageResponse;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ChatApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ChatApiError(
        'Request timed out. Please try again.',
        408
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ChatApiError(
        'Unable to connect to the server. Please check your connection and try again.',
        0
      );
    }

    throw new ChatApiError(
      'An unexpected error occurred. Please try again.',
      500
    );
  }
}

/**
 * Fetch chat history for a given session ID.
 */
export async function fetchChatHistory(
  sessionId: string
): Promise<ChatHistoryResponse> {
  try {
    const response = await fetch(`${API_BASE}/chat/${sessionId}/history`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new ChatApiError('Conversation not found.', 404);
      }
      const errorBody = (await response.json().catch(() => null)) as ApiError | null;
      throw new ChatApiError(
        errorBody?.error || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return (await response.json()) as ChatHistoryResponse;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }

    throw new ChatApiError(
      'Unable to load chat history. Please try again.',
      500
    );
  }
}
