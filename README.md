# Treki - Your Travel Planner AI Agent

AI-powered travel planner that extracts recommendations from YouTube videos and provides an interactive chat interface. Built with FastAPI, Next.js, LangChain, and observability tools (OpenTelemetry + Langfuse).

## Features

- **YouTube Video Ingestion**: Process 1-10 YouTube travel videos and extract place recommendations
- **Smart Extraction**: Uses LLMs (OpenAI GPT-4 or Anthropic Claude) to extract structured place data
- **Interactive Chat**: Ask questions about places using an AI agent with tool calling
- **Dual LLM Support**: Choose between OpenAI and Anthropic for each request
- **Observability**: Built-in tracing with OpenTelemetry and Langfuse integration
- **Session Management**: In-memory sessions with automatic cleanup
- **Modern Stack**: FastAPI backend + Next.js 14 frontend with TypeScript

## Project Structure

```
travel-planner/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── models/       # Pydantic data models
│   │   ├── services/     # Business logic (YouTube, LLM, extraction, chat)
│   │   ├── api/routes/   # API endpoints
│   │   ├── observability/# OpenTelemetry + Langfuse
│   │   └── utils/        # Logging and errors
│   └── tests/            # Pytest test suite
│
├── frontend/             # Next.js frontend
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   └── lib/              # API client and types
│
└── .llm/SPEC_v0.md       # Full specification
```

## Tech Stack

### Backend

- **Python 3.11+** with `uv` package manager
- **FastAPI** for REST API
- **LangChain** for LLM abstraction (OpenAI + Anthropic)
- **youtube-transcript-api** for transcript fetching
- **OpenTelemetry** + **Langfuse** for observability
- **pytest** for testing

### Frontend

- **Next.js 14+** with App Router
- **TypeScript** + **React 19**
- **Tailwind CSS** for styling
- **pnpm** package manager

## Quick Start

### Prerequisites

- Python 3.11+ with `uv` installed
- Node.js 18+ with `pnpm` installed
- API keys:
  - OpenAI API key (for GPT-4)
  - Anthropic API key (for Claude)
  - Langfuse credentials (optional, for observability)

### Backend Setup

```bash
cd backend

# Install dependencies
uv pip install -e ".[dev]"

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Run tests
pytest tests/ -v

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.local.example .env.local
# Edit .env.local to point to backend (default: http://localhost:8000)

# Start development server
pnpm dev
```

Frontend will be available at `http://localhost:3000`

## Usage

1. **Start both servers** (backend on :8000, frontend on :3000)

2. **Add YouTube URLs**:

   - Enter 1-10 YouTube travel video URLs
   - Select LLM provider (OpenAI or Anthropic)
   - Click "Extract Places"

3. **View Results**:

   - See video summaries
   - Browse extracted places by type (restaurants, attractions, hotels, activities)

4. **Chat with AI**:
   - Ask questions like "What are the best restaurants?"
   - Agent uses tools to search places and provide recommendations
   - All responses cite source videos

## API Endpoints

### POST /api/ingest

Ingest YouTube videos and extract places.

**Request:**

```json
{
  "video_urls": ["https://www.youtube.com/watch?v=VIDEO_ID"],
  "llm_provider": "openai"
}
```

**Response:**

```json
{
  "session_id": "uuid",
  "videos": [...],
  "total_places": 12,
  "processing_time_ms": 3500
}
```

### POST /api/chat

Chat with the AI agent.

**Request:**

```json
{
  "session_id": "uuid",
  "message": "What are the best restaurants?",
  "llm_provider": "openai"
}
```

**Response:**

```json
{
  "message": "Based on the videos...",
  "places_referenced": ["place-id-1", "place-id-2"],
  "sources": [...]
}
```

### GET /api/session/{session_id}

Retrieve session data (videos, places, chat history).

### DELETE /api/session/{session_id}

Delete a session.

## Environment Variables

### Backend (.env)

```bash
# LLM API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Observability (optional)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
SESSION_TTL_SECONDS=3600
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

```bash
cd backend
pytest tests/ -v

# Run specific test file
pytest tests/test_youtube.py -v

# Run with coverage
pytest tests/ --cov=app
```

## Deployment (Railway)

This project is configured for deployment on [Railway](https://railway.app).

1. Create a new project on Railway
2. Add two services:
   - **Backend**: Point to `backend/` directory
   - **Frontend**: Point to `frontend/` directory
3. Set environment variables for each service
4. Railway will auto-detect and deploy both services

## Development Notes

- **Session Storage**: Currently uses in-memory dict. Sessions expire after 1 hour of inactivity.
- **YouTube Metadata**: MVP uses placeholder data. Integrate YouTube Data API v3 for real metadata.
- **Observability**: Langfuse integration is simplified for MVP. See decorator in `observability/langfuse_client.py`.
- **Tool Calling**: Chat agent uses LangChain's tool binding for place search and transcript retrieval.

## Future Enhancements

- Map visualization with place markers
- Export itinerary to PDF/Google Maps
- Persistent storage with PostgreSQL
- WebSocket streaming for real-time chat
- Multi-user support with authentication
- A/B testing different prompts
- Braintrust integration for evals

## Architecture

```
┌─────────────┐
│   Frontend  │  Next.js SPA
│  (Next.js)  │  Components: VideoInput, PlaceSummary, ChatInterface
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │  FastAPI REST API
│  (FastAPI)  │  Routes: /ingest, /chat, /session/{id}
└──────┬──────┘
       │
       ├──► YouTubeService → Fetch transcripts
       ├──► LLMClient → OpenAI/Anthropic (via LangChain)
       ├──► ExtractionService → Extract places from transcripts
       ├──► ChatAgent → Answer questions with tools
       ├──► SessionManager → In-memory session storage
       └──► Observability → OpenTelemetry + Langfuse
```

## License

MIT

## Contributing

PRs welcome! Please ensure tests pass before submitting.

---

Built with Claude Code • [View Specification](.llm/SPEC_v0.md)
