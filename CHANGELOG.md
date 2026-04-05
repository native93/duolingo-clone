# Changelog

All notable changes to the 99 Names of Allah learning app.

## Vision

**Target Audience:** Muslims who can read Arabic script and recite surahs, but don't understand the meaning of the words they recite.

**Problem:** Millions of people recite Quran daily without understanding. They know HOW to say the words but not WHAT they mean.

**Solution:** Start with the 99 Names of Allah as gateway vocabulary. Each name is:
- Commonly known and recited
- Has a clear, distinct meaning
- Appears throughout the Quran
- Builds foundation for Quranic comprehension

**App Goal:** Bridge from recitation → understanding. "Understand what you recite."

---

## [Unreleased]

### Added
- 99 Arabic audio files generated using macOS TTS (Majed voice) - `/public/audio/`
- JSON data file with all 99 Names and audio paths - `/public/data/99-names-with-audio.json`
- Seed script for 99 Names of Allah content - `scripts/seed-99-names.ts`
- Kaaba SVG icon for course - `/public/kaaba.svg`
- `db:seed-names` npm script to populate database with 99 Names content
- Course structure: 1 course → 10 units → 99 lessons → 297 challenges → 891 options
- RTL (right-to-left) support for Arabic text with automatic detection - `lib/arabic.ts`
- Amiri Arabic font for proper Arabic text rendering

### Changed
- Rebranded from "Lingo" to "Asma ul Husna"
- Color scheme changed from green to teal (Islamic-inspired)
- Site metadata updated for 99 Names of Allah learning app
- Logo changed from mascot to Kaaba icon
- Arabic text displays larger (2xl/3xl) with proper RTL direction

### Fixed
- Upgraded react-admin v4 → v5 and ra-data-simple-rest v4 → v5 for React 19 compatibility

### Changed
- Hearts system now uses practice-only refill (no payment upgrade option)
- Shop page simplified to show points-based heart refill only

### Removed
- Stripe payment integration completely removed
- `lib/stripe.ts` - Stripe client
- `actions/user-subscription.ts` - Subscription actions
- `app/api/webhooks/stripe/` - Stripe webhook handler
- `userSubscription` table from database schema
- `getUserSubscription` query
- `components/promo.tsx` - Pro upgrade upsell component
- All "unlimited hearts" subscription features from UI
- Stripe dependency from package.json
- Stripe environment variables from `.env.example`

---

## Decision Log

### 2026-04-04: Project Setup

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Authentication** | Keep Clerk (free tier) | Already integrated, 10k MAU free, handles OAuth/Google login |
| **Hearts System** | Keep with practice-only refill | Gamification without paywall - wrong answers cost hearts, practice mode refills |
| **Audio Source** | macOS TTS (v1 placeholder) | Quick to generate all 99 names; pronunciation not perfect (missing elongated vowels/tajweed) |
| **Audio Quality** | TO BE IMPROVED | TTS doesn't handle madd (elongated vowels) correctly - e.g., "Ar-Rahmaan" should have long 'aa'. Plan to replace with proper recordings in future iteration |
| **Deployment** | Vercel | Zero-cost, works well with Next.js and Clerk |

### Pending Decisions
- [ ] App name (Asma ul Husna / 99 Names / custom)
- [ ] Color scheme (Islamic green-gold / blue-white / custom)

---

## Future Improvements

### Audio (Priority: High)
- [ ] Replace TTS audio with properly recorded recitations
- [ ] Ensure correct tajweed (elongated vowels, proper pronunciation)
- [ ] Consider adding meanings read in English

### Content
- [ ] Add more lesson types beyond just name recognition
- [ ] Include Quranic verses where each name appears
- [ ] Add explanations/tafsir for each name

### Features
- [ ] Dark mode support
- [ ] Offline mode
- [ ] Progress sharing
