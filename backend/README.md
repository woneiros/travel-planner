# Treki: Backend

AI-powered travel planning backend with observability.

## Setup

### Prerequisites

- Python 3.11+
- `uv` package manager

### Installation

```bash
# Install dependencies
uv pip install -e ".[dev]"

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
```

### Running Locally

```bash
# Development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

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

### POST /api/chat

Chat with the AI agent about extracted places.

**Request:**

```json
{
  "session_id": "uuid",
  "message": "What are the best restaurants?",
  "llm_provider": "openai"
}
```

### GET /api/session/{session_id}

Retrieve session data.

### DELETE /api/session/{session_id}

Delete a session.

## Testing

```bash
pytest tests/ -v
```

## Environment Variables

See `.env.example` for all required environment variables.

## Architecture

- **models/**: Pydantic data models
- **services/**: Business logic (YouTube, LLM, extraction)
- **api/routes/**: FastAPI route handlers
- **observability/**: OpenTelemetry and Langfuse setup
- **utils/**: Logging and error handling
