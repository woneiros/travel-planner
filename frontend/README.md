# Travel Planner Frontend

Next.js frontend for the Travel Planner AI application.

## Tech Stack

- Next.js 15+ (App Router)
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

Visit `http://localhost:3000` for the app or `http://localhost:3000/landing` for the landing page

## Components

### App Components
- **VideoInput**: YouTube URL input form with LLM provider selection
- **PlaceSummary**: Displays extracted places grouped by type
- **ChatInterface**: Interactive chat with the AI agent
- **LoadingState**: Loading spinner component

### Landing Page Components
- **HeroSection**: Hero section with headline and CTA
- **FeatureGrid**: Grid of feature cards
- **WaitlistForm**: Email signup form for waitlist
- **Footer**: Footer with logo and links

## API Integration

The frontend communicates with the FastAPI backend via the API client in `lib/api.ts`.

All types are defined in `lib/types.ts`.

## Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Resend Email Service (for waitlist)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Email address to receive waitlist notifications
WAITLIST_NOTIFICATION_EMAIL=your-email@example.com
```

### Setting up Resend for Waitlist

1. Sign up at https://resend.com/
2. Get your API key from https://resend.com/api-keys
3. Add `RESEND_API_KEY` to your `.env.local` file
4. Add `WAITLIST_NOTIFICATION_EMAIL` with your email address
5. Update the `from` email in `app/api/waitlist/route.ts` once you verify a domain (or use `onboarding@resend.dev` for testing)

## Build

```bash
pnpm build
pnpm start
```

## Deployment

Deploys automatically to Railway when connected to the repository.
