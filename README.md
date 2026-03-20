# MergeForge

AI-powered multi-repo project management. Unify your GitHub repositories into a single workspace with unified issue tracking, real-time collaboration, and AI-powered app generation.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.6-black)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4)
![Supabase](https://img.shields.io/badge/Supabase-2.56.0-3ECF8E)

## Features

### Phase 1 (Current)
- 🔐 **GitHub OAuth Authentication** - Secure sign-in with GitHub
- 🏗️ **Multi-repo Forge Workspaces** - Organize projects across repositories
- 📊 **Unified Dashboard** - Overview of all your forges
- 📝 **Issue Board** - Kanban-style board with drag-and-drop
- 🔄 **Real-time Sync** - Live updates via Supabase Realtime
- 🔗 **GitHub Repo Linking** - Connect repositories to forges
- 📈 **Activity Feed** - Track changes across linked repos
- 👥 **Team Collaboration** - Role-based access control

### Phase 2 (Coming)
- 🤖 **AI Merge Suggestions** - Smart PR grouping and conflict detection
- 📋 **Cross-repo PR Analysis** - Unified pull request view
- 🎯 **Milestone Planning** - Cross-repo roadmap management

### Phase 3 (Coming)
- 🏗️ **App Builder** - Generate full-stack apps from repo analysis
- 🤖 **AI Architecture Planning** - AI-powered app generation
- 📦 **Artifact Export** - Download generated code

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://typescriptlang.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Auth | Supabase Auth + GitHub OAuth |
| Realtime | Supabase Realtime |
| API | [Octokit](https://github.com/octokit) (GitHub API) |
| Drag & Drop | [@dnd-kit](https://dndkit.com) |
| Icons | [Lucide React](https://lucide.dev) |

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- A Supabase account (free tier works)
- A GitHub account with OAuth app

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/mergeforge.git
cd mergeforge

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Supabase (from https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub OAuth (from https://github.com/settings/applications/new)
# Authorization callback URL: http://localhost:3000/api/github/callback
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the migrations in order from `supabase/migrations/`
4. Run the seed file `supabase/seed.sql`

Or using Supabase CLI:

```bash
# Start Supabase locally
npm run supabase:start

# Run migrations
npm run supabase:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Prepare Your Repository

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/mergeforge.git
git push -u origin main
```

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Environment Variables on Vercel

Add these environment variables in your Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g., `https://mergeforge.vercel.app`) |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth app secret |

### 4. Update GitHub OAuth Callback

After deployment, update your GitHub OAuth app's **Authorization callback URL** to:

```
https://your-vercel-domain.com/api/github/callback
```

## Database Schema

### Core Tables

```
profiles              - User profiles
forges                - Project workspaces
forge_members         - Forge membership & roles
forge_milestones      - Milestone tracking

github_accounts       - GitHub OAuth connections
linked_repos          - Connected repositories

unified_issues        - Cross-repo issues
pr_activity           - Pull request tracking
activity_events       - Activity feed

builder_sessions      - AI builder sessions
builder_artifacts     - Generated code artifacts
repo_analysis_cache   - Repository analysis cache
```

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Users can only see data from forges they're members of
- Forge owners have full CRUD access
- Members have read/modify access based on their role
- GitHub tokens are only accessible to the owning user

## Project Structure

```
mergeforge/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup, onboarding)
│   ├── api/                      # API routes
│   │   ├── forge/[id]/          # Forge-specific APIs
│   │   └── github/              # GitHub OAuth & APIs
│   ├── auth/                     # Auth callback & error
│   ├── dashboard/                # Dashboard page
│   ├── forge/[id]/              # Forge pages
│   │   ├── builder/             # App builder
│   │   ├── loading.tsx          # Loading state
│   │   ├── not-found.tsx        # 404 state
│   │   └── page.tsx             # Main forge view
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── builder/                  # Builder components
│   ├── forge/                    # Forge components
│   ├── providers/                # Context providers
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities
│   ├── supabase/                # Supabase clients
│   ├── auth.ts                   # Auth helpers
│   ├── board.ts                  # Board logic
│   ├── builder.ts                # Builder types
│   ├── constants.ts              # App constants
│   ├── github.ts                 # GitHub API
│   ├── github-ingest.ts          # Repo ingestion
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utilities
├── supabase/
│   ├── functions/                # Edge functions
│   ├── migrations/               # Database migrations
│   └── seed.sql                  # Seed data
└── [config files]
```

## Available Scripts

```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run supabase:start   # Start Supabase locally
npm run supabase:reset   # Reset local Supabase
npm run supabase:migrate # Run migrations
npm run gen:types        # Generate Supabase types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- 🔒 **GitHub tokens** are stored server-side only and never exposed to the client
- 🛡️ **RLS policies** protect all data at the database level
- 🔐 **Service role key** is only used in secure server contexts
- 🚫 **No sensitive data** is logged or exposed in error messages

## License

MIT License - see LICENSE file for details

## Support

- 📖 [Documentation](https://docs.mergeforge.dev)
- 🐛 [Issue Tracker](https://github.com/yourusername/mergeforge/issues)
- 💬 [Discussions](https://github.com/yourusername/mergeforge/discussions)

---

Built with ❤️ using Next.js, Supabase, and GitHub
