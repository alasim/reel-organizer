# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # Type-check only (tsc --noEmit) — no separate test suite
npm run preview   # Preview production build
```

## Architecture

Pure client-side SPA. No backend. All data persists via `localStorage` under keys `reel_organizer_categories` and `reel_organizer_reels`.

**State ownership**: All app state lives in [src/App.tsx](src/App.tsx). Child components are stateless and receive handlers as props. There is no state management library.

**Data model** ([src/types.ts](src/types.ts)):
- `Category` — `{ id, name, iconName, color }` where `color` is one of the fixed strings: `emerald | amber | sky | purple | rose`
- `Reel` — `{ id, title, categoryId, embedCode, url?, notes?, tags[], isFavorite, createdAt, rating?, platform }` where `platform` is `instagram | facebook | tiktok | other`

**URL parsing** ([src/utils/reelParser.ts](src/utils/reelParser.ts)): `parseReelUrl()` converts raw Instagram/TikTok/Facebook URLs or raw `<iframe>` HTML into a normalized embed URL. It also detects the platform. This is the entry point for all reel input.

**Component map**:
- `ReelCard` — grid card with inline `<iframe>` embed, star rating, tag pills, favorite toggle
- `ReelFormModal` — add/edit reel; calls `parseReelUrl` on submit
- `CategoryFormModal` — create/delete categories; deleting reassigns orphaned reels to the first remaining category
- `ReelPlayerModal` — theater-mode fullscreen player modal
- `LucideIcon` — renders any Lucide icon by string name via dynamic import

**Backup/restore**: JSON copy-paste in the Backup & Restore modal. Payload shape: `{ categories, reels, version }`.

## Stack

- React 19 + TypeScript
- Vite 6 with `@tailwindcss/vite` plugin (Tailwind v4 — no `tailwind.config.js`)
- `motion/react` (Framer Motion v12) for `AnimatePresence` and `motion.div` layout animations
- `lucide-react` for icons
- `@google/genai` package is installed but not yet used in the UI
- Path alias `@` resolves to the project root
