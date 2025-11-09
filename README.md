# Treki - Your Travel Planner AI Agent

<img src="./docs/Treki_Logo_Color_Neutral%20BG.png" style="height: 150px"/>

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
