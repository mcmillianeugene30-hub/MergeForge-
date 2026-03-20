# MergeForge

AI-powered multi-repo project management. Unify your GitHub repositories into a single workspace.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth, Database, Realtime)
- Octokit (GitHub API)

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your environment variables
2. Install dependencies: `npm install`
3. Start Supabase locally: `npm run supabase:start`
4. Run migrations: `npm run supabase:migrate`
5. Start the dev server: `npm run dev`

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI (optional)
OPENAI_API_KEY=
GROQ_API_KEY=
```

## Features

- GitHub OAuth authentication
- Multi-repo Forge workspaces
- RLS-protected data access
- Realtime-ready setup
- GitHub repository linking
- Unified issues/PR tracking
- Activity feed
- AI-powered merge suggestions (Phase 2)

## Project Structure

```
mergeforge/
├── app/                    # Next.js App Router
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forge/            # Forge-specific components
│   └── providers/        # Context providers
├── lib/                   # Utilities and types
├── supabase/             # Database migrations and functions
└── public/               # Static assets
```

## Database Schema

See `supabase/migrations/` for the full schema including:
- profiles
- forges
- forge_members
- github_accounts
- linked_repos
- unified_issues
- pr_activity
- activity_events
# MergeForge-
