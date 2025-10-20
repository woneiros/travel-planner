# Travel Planner Frontend

Next.js frontend for the Travel Planner AI application.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- React 19
- Tailwind CSS
- pnpm

## Development

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.local.example .env.local

# Start dev server
pnpm dev
```

Visit `http://localhost:3000`

## Components

- **VideoInput**: YouTube URL input form with LLM provider selection
- **PlaceSummary**: Displays extracted places grouped by type
- **ChatInterface**: Interactive chat with the AI agent
- **LoadingState**: Loading spinner component

## API Integration

The frontend communicates with the FastAPI backend via the API client in `lib/api.ts`.

All types are defined in `lib/types.ts`.

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Build

```bash
pnpm build
pnpm start
```

## Deployment

Deploys automatically to Railway when connected to the repository.
