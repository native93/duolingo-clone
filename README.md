# Quranic Vocabulary - Learning App

A free Quranic Arabic learning app focused on teaching essential Islamic vocabulary through interactive lessons.

> Forked from [sanidhyy/duolingo-clone](https://github.com/sanidhyy/duolingo-clone) and refactored for Islamic education.

## Project Goals

- **Zero-cost**: Free for all users, no payments or subscriptions
- **RTL Support**: Proper right-to-left Arabic text display
- **Local Audio**: All audio stored locally, no external services
- **Gamified Learning**: Hearts system with practice-based refills (no paywall)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk (free tier - 10k MAU)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in:
   - `CLERK_PUBLISHABLE_KEY` - from Clerk dashboard
   - `CLERK_SECRET_KEY` - from Clerk dashboard
   - `DATABASE_URL` - from Neon dashboard
3. Run `bun install`
4. Run `bun run db:push` to set up database
5. Run `bun run db:seed` to seed content
6. Run `bun dev` to start development server

## Content

- Quranic vocabulary with Arabic text, transliteration, and English meanings
- Audio pronunciation for each term
- Quiz-style challenges to test recognition
- Multiple lesson types: learn, review, and checkpoint

## Project Status

See [CHANGELOG.md](./CHANGELOG.md) for all decisions and progress tracking.

### Completed
- [x] Fork and clone repository
- [x] Generate audio files
- [x] Create data JSON with audio paths
- [x] Decision: Keep Clerk auth
- [x] Decision: Hearts with practice-only refill
- [x] Remove Stripe/payment integration

### In Progress
- [ ] Add RTL support
- [ ] Update branding
- [ ] Seed database with vocabulary content

### Future
- [ ] Add more vocabulary modules
- [ ] Dark mode

---

## Original Project

This project is based on the excellent [Lingo/Duolingo Clone](https://github.com/sanidhyy/duolingo-clone) by [@sanidhyy](https://github.com/sanidhyy). See the original README below for detailed setup instructions and acknowledgements.

---

<details>
<summary>Original README (click to expand)</summary>

<!-- Original content preserved for reference -->
See original repo: https://github.com/sanidhyy/duolingo-clone

</details>
