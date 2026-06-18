import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  DATABASE_PATH: z.string().default("./data/chat.db"),
  MAX_TOKENS: z.coerce.number().default(500),
  MAX_MESSAGE_LENGTH: z.coerce.number().default(2000),
  MAX_HISTORY_MESSAGES: z.coerce.number().default(20),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of parsed.error.issues) {
      console.error(`   ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error("  👉 Get a free Groq API key at https://console.groq.com");
    process.exit(1);
  }

  return parsed.data;
}

export const config = loadConfig();
export type Config = z.infer<typeof envSchema>;
