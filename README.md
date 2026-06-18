# Splur — AI Live Chat Agent

A production-quality AI customer support chat application built for the Spur founding engineer take-home. Features a real-time chat interface with an AI agent (Luna) that answers questions about a fictional artisan home goods store (Lunara).

![Tech Stack](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte_5-FF3E00?style=flat&logo=svelte&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-f55036?style=flat&logo=groq&logoColor=white)

## Features

- 💬 **Real-time chat UI** — Polished dark/light theme with message bubbles, typing indicator, auto-scroll
- 🤖 **AI-powered responses** — Groq Llama 3.3 70B with contextual conversation history
- 📚 **FAQ knowledge base** — Seeded domain knowledge (shipping, returns, payments, support hours)
- 💾 **Persistent conversations** — SQLite-backed, survives page reloads via session ID in localStorage
- 🛡️ **Robust error handling** — Graceful LLM failures, input validation, rate limit handling
- 🎨 **Beautiful design** — Glass-morphism effects, gradient accents, smooth animations, responsive layout
- ⌨️ **Great UX** — Enter to send, Shift+Enter for newline, typing indicator, suggested questions, character limit

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Groq API key ([get one here](https://console.groq.com/keys))

### 1. Clone & Setup Environment

```bash
git clone <your-repo-url>
cd splur

# Create environment file
cp .env.example backend/.env
```

Edit `backend/.env` and add your Groq API key:
```
GROQ_API_KEY=your-actual-key-here
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:3001`. On first run, it automatically:
- Creates the SQLite database (`./data/chat.db`)
- Runs schema migrations
- Seeds FAQ data for the Lunara store

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`. Open it in your browser and start chatting!

### Database Setup

**No manual setup required.** The database is automatically created and migrated on first backend start. FAQ data is auto-seeded when the `faq_entries` table is empty.

To manually re-seed FAQ data:
```bash
cd backend
npm run db:seed
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ | — | Your Groq API key |
| `PORT` | | `3001` | Backend server port |
| `DATABASE_PATH` | | `./data/chat.db` | SQLite database file path |
| `MAX_TOKENS` | | `500` | Max tokens per LLM response |
| `MAX_MESSAGE_LENGTH` | | `2000` | Max characters per user message |
| `MAX_HISTORY_MESSAGES` | | `20` | Max messages sent as LLM context |
| `FRONTEND_URL` | | `http://localhost:5173` | CORS allowed origin |
| `NODE_ENV` | | `development` | Environment mode |
| `VITE_API_URL` | | `http://localhost:3001` | Backend URL (frontend env) |

---

## Architecture

```
splur/
├── backend/                    # Express + TypeScript API server
│   └── src/
│       ├── index.ts            # Entry point — Express app bootstrap
│       ├── config.ts           # Zod-validated environment config
│       ├── types.ts            # Shared TypeScript types
│       ├── routes/
│       │   └── chat.ts         # Chat endpoints (POST /message, GET /history)
│       ├── services/
│       │   └── llm.ts          # Groq integration (generateReply)
│       ├── models/
│       │   ├── conversation.ts # Conversation CRUD
│       │   └── message.ts      # Message CRUD
│       ├── middleware/
│       │   ├── validation.ts   # Zod request validation
│       │   └── errorHandler.ts # Global error handler
│       └── db/
│           ├── index.ts        # SQLite connection manager
│           ├── schema.ts       # Table migrations
│           └── seed.ts         # FAQ seed data
│
├── frontend/                   # SvelteKit 5 chat UI
│   └── src/
│       ├── routes/
│       │   ├── +layout.svelte  # Root layout (global CSS)
│       │   └── +page.svelte    # Main page with chat widget
│       └── lib/
│           ├── components/
│           │   ├── ChatWidget.svelte      # Main container
│           │   ├── ChatInput.svelte       # Input + send button
│           │   ├── MessageBubble.svelte   # User/AI message bubbles
│           │   └── TypingIndicator.svelte # "Luna is typing..." 
│           ├── stores/
│           │   └── chat.ts     # Svelte stores for state management
│           ├── api.ts          # Backend API client
│           └── types.ts        # Frontend type definitions
│
├── .env.example
├── .gitignore
└── README.md
```

### Design Principles

1. **Separation of Concerns** — Routes handle HTTP, services handle business logic, models handle data access
2. **Extensibility** — Adding a new channel (WhatsApp, Instagram) means adding a new route that calls the same `generateReply()` service
3. **Encapsulated LLM** — The entire Groq integration lives in `services/llm.ts`. Swapping to another provider requires changing only this file
4. **Schema-first** — Clean relational schema with conversations → messages, ready for PostgreSQL migration

### Data Model

```
conversations                    messages
┌──────────────────────┐        ┌────────────────────────────┐
│ id (PK)              │───┐    │ id (PK)                    │
│ created_at           │   │    │ conversation_id (FK) ──────│
│ metadata (JSON)      │   └────│ sender ('user' | 'ai')     │
└──────────────────────┘        │ text                       │
                                │ created_at                 │
                                └────────────────────────────┘

faq_entries
┌────────────────────────────┐
│ id (PK)                    │
│ category                   │
│ question                   │
│ answer                     │
└────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/message` | Send a message, get AI reply |
| `GET` | `/chat/:sessionId/history` | Fetch conversation history |
| `GET` | `/health` | Health check |

**POST /chat/message**
```json
// Request
{ "message": "What's your return policy?", "sessionId": "optional-uuid" }

// Response  
{ "reply": "We offer a 30-day return policy...", "sessionId": "uuid" }
```

---

## LLM Integration

### Provider
**Groq Llama-3.3-70B-Versatile** — chosen for being blazing fast and completely free (up to generous rate limits). The integration is fully encapsulated in `backend/src/services/llm.ts`.

### Prompting Strategy
1. **System prompt** defines the agent persona (Luna) with clear behavioral guidelines
2. **FAQ knowledge base** is dynamically loaded from the database and injected into the system prompt
3. **Conversation history** (last 20 messages) is included for contextual responses
4. **Guardrails**: 
   - Agent won't make up policies not in the knowledge base
   - Redirects to human support for questions it can't answer
   - Stays on-topic (won't discuss unrelated subjects)
   - Responses capped at ~150 words for conciseness

### Error Handling
- **401 (Invalid Key)**: "Having trouble connecting to my brain..."
- **429 (Rate Limited)**: "A bit overwhelmed with requests..."
- **500/503 (Server Error)**: "Experiencing technical difficulties..."
- **Timeout (30s)**: "Taking too long to think..."
- All errors surface as friendly messages in the chat UI

### Cost Controls
- `MAX_TOKENS=500` caps each response
- `MAX_HISTORY_MESSAGES=20` limits context window
- `MAX_MESSAGE_LENGTH=2000` prevents oversized inputs
- Request body limited to 10KB at Express level

---

## Trade‑offs & "If I Had More Time…"

### What I'd improve:
- **Streaming responses** — Use SSE/WebSocket to stream LLM tokens for a more responsive feel
- **Authentication** — Add session-based auth so conversations are tied to users
- **Rate limiting** — Add per-IP rate limiting with Redis to prevent abuse
- **Redis caching** — Cache FAQ data and recent conversations for faster responses
- **WebSocket** — Replace polling with real-time bidirectional communication
- **Testing** — Add comprehensive unit tests (Vitest) and E2E tests (Playwright)
- **RAG** — Use vector embeddings + semantic search instead of dumping all FAQs into the prompt
- **Multi-channel** — Add WhatsApp/Instagram webhook handlers that call the same `generateReply()` service
- **Admin dashboard** — View all conversations, analytics, agent performance metrics
- **Markdown rendering** — Parse AI responses for bold, lists, links
- **Message reactions** — Thumbs up/down feedback on AI responses for quality tracking
- **Docker Compose** — One-command setup for the full stack
- **CI/CD** — GitHub Actions for lint, test, and deploy on push

### Deliberate trade-offs:
- **SQLite over PostgreSQL**: Simpler for the exercise, but the schema is designed to port to Postgres with zero changes to the SQL
- **All FAQs in system prompt**: Works fine for a small knowledge base (~12 entries). For a larger KB, I'd use RAG with vector search
- **No auth**: Keeps the scope focused. Sessions are identified by UUID stored in localStorage
- **Synchronous DB (better-sqlite3)**: Chosen for simplicity and speed. For production, I'd use an async driver like `drizzle-orm` + `libsql`
