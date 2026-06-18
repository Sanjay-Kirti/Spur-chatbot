import { writable, get } from 'svelte/store';
import type { Message } from '$lib/types';
import { sendChatMessage, fetchChatHistory, ChatApiError } from '$lib/api';

/** The list of chat messages */
export const messages = writable<Message[]>([]);

/** Current session/conversation ID */
export const sessionId = writable<string | null>(null);

/** Whether a request is currently in flight */
export const isLoading = writable(false);

/** Current error message (null if no error) */
export const error = writable<string | null>(null);

/** Whether initial history is being loaded */
export const isLoadingHistory = writable(false);

/**
 * Send a message from the user and get an AI reply.
 * Handles optimistic UI updates, API calls, and error states.
 */
export async function sendMessage(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || get(isLoading)) return;

  // Clear any previous error
  error.set(null);
  isLoading.set(true);

  // Optimistic UI: add user message immediately
  const tempUserMessage: Message = {
    id: `temp-${Date.now()}`,
    conversation_id: get(sessionId) || '',
    sender: 'user',
    text: trimmed,
    created_at: new Date().toISOString(),
  };
  messages.update((msgs) => [...msgs, tempUserMessage]);

  try {
    const currentSessionId = get(sessionId) || undefined;
    const response = await sendChatMessage(trimmed, currentSessionId);

    // Update session ID (important for first message)
    if (!get(sessionId)) {
      sessionId.set(response.sessionId);
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('splur_session_id', response.sessionId);
      }
    }

    // Add AI reply
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      conversation_id: response.sessionId,
      sender: 'ai',
      text: response.reply,
      created_at: new Date().toISOString(),
    };
    messages.update((msgs) => [...msgs, aiMessage]);
  } catch (err: unknown) {
    const errorMsg =
      err instanceof ChatApiError
        ? err.message
        : 'Something went wrong. Please try again.';

    error.set(errorMsg);

    // Remove the optimistic user message on error
    messages.update((msgs) =>
      msgs.filter((m) => m.id !== tempUserMessage.id)
    );
  } finally {
    isLoading.set(false);
  }
}

/**
 * Load conversation history from the server.
 * Used when restoring a session on page reload.
 */
export async function loadHistory(sid: string): Promise<void> {
  isLoadingHistory.set(true);
  error.set(null);

  try {
    const response = await fetchChatHistory(sid);
    sessionId.set(response.sessionId);
    messages.set(response.messages);
  } catch (err: unknown) {
    // If conversation not found, clear the stored session
    if (err instanceof ChatApiError && err.statusCode === 404) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('splur_session_id');
      }
      sessionId.set(null);
      messages.set([]);
    } else {
      error.set('Failed to load chat history.');
    }
  } finally {
    isLoadingHistory.set(false);
  }
}

/**
 * Start a new conversation (clear current session).
 */
export function startNewChat(): void {
  sessionId.set(null);
  messages.set([]);
  error.set(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('splur_session_id');
  }
}
