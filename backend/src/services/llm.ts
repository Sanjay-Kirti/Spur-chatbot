import Groq from "groq-sdk";
import { config } from "../config.js";
import { formatFaqForPrompt } from "../db/seed.js";
import type { Message } from "../types.js";

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

/** Maximum time to wait for an LLM response (ms) */
const LLM_TIMEOUT_MS = 30_000;

/**
 * Model to use. llama-3.3-70b-versatile is Groq's best free model —
 * fast, smart, and generous free tier (100 req/min, 6000 tokens/min).
 */
const MODEL = "llama-3.3-70b-versatile";

/**
 * Build the system prompt with agent persona and FAQ knowledge.
 */
function buildSystemPrompt(faqContext: string): string {
  return `You are Luna, a friendly and professional customer support agent for Lunara — an online artisan home goods store.

## Your Personality
- Warm, helpful, and concise
- You speak in a natural, conversational tone — not robotic
- You use the customer's context from the conversation to give relevant answers
- You occasionally use emojis sparingly (1-2 per message max) to feel approachable

## Your Knowledge Base
Below is the store's official FAQ and policy information. Use this as your source of truth when answering questions:

${faqContext}

## Guidelines
1. Answer questions clearly and concisely based on the knowledge base above.
2. If a question is about something not covered in your knowledge base, politely let the customer know and suggest they contact our support team at support@lunara.store or during live chat hours (Mon–Fri, 9 AM – 6 PM ET).
3. NEVER make up policies, prices, or details that aren't in your knowledge base.
4. If a customer seems frustrated, acknowledge their feelings empathetically before providing a solution.
5. For order-specific questions (tracking, specific order issues), ask for their order number and suggest they contact support for personalized help.
6. Keep responses under 150 words unless the question requires a detailed explanation.
7. If the customer greets you or makes small talk, respond warmly but guide the conversation toward how you can help.
8. Do not discuss topics unrelated to Lunara, shopping, or customer support. Politely redirect.`;
}

/**
 * Convert conversation history to Groq/OpenAI message format.
 */
function buildMessageHistory(
  history: Message[],
  userMessage: string
): Groq.Chat.Completions.ChatCompletionMessageParam[] {
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];

  for (const msg of history) {
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    });
  }

  messages.push({ role: "user", content: userMessage });

  return messages;
}

/**
 * Generate an AI reply using the Groq API (Llama 3.3 70B).
 *
 * @param history - Previous messages in the conversation (for context)
 * @param userMessage - The current user message to respond to
 * @returns The AI-generated reply text
 * @throws Error with a user-friendly message on failure
 */
export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  const faqContext = formatFaqForPrompt();
  const systemPrompt = buildSystemPrompt(faqContext);
  const messageHistory = buildMessageHistory(history, userMessage);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const completion = await groq.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messageHistory,
        ],
        max_tokens: config.MAX_TOKENS,
        temperature: 0.7,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      throw new Error("Groq returned an empty response.");
    }

    return reply.trim();
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Timeout / abort
    if (error instanceof Error && error.name === "AbortError") {
      console.error("LLM request timed out.");
      throw new Error(
        "Sorry, I'm taking too long to think! Please try again. If the issue persists, contact support@lunara.store."
      );
    }

    // Groq SDK wraps API errors — check status code via the error object
    if (error instanceof Groq.APIError) {
      console.error(`Groq API error: ${error.status} - ${error.message}`);

      if (error.status === 401) {
        throw new Error(
          "I'm having trouble connecting to my brain right now. Please try again later or contact support@lunara.store."
        );
      }
      if (error.status === 429) {
        throw new Error(
          "I'm a bit overwhelmed with requests right now! Please wait a moment and try again. 😊"
        );
      }
      if (error.status >= 500) {
        throw new Error(
          "I'm experiencing some technical difficulties. Please try again in a moment, or reach out to support@lunara.store."
        );
      }

      throw new Error(
        "Something went wrong on my end. Please try again, or contact support@lunara.store for help."
      );
    }

    console.error("Unexpected LLM error:", error);
    throw new Error(
      "Oops! Something unexpected happened. Please try again, or contact support@lunara.store."
    );
  }
}
