# bodycam-agent-fe — chat prototype

A standalone chat interface built on **Headwind UI** (`@cycomdatasystems/headwindui@1.5.2`), following the conventions in CityLaw NG's front-end theming brief (18 Sep 2026): cascade-layer order, `hw-*` design tokens, dark-mode wiring, scroll/z-index conventions, and the `.tiptap` rich-text scale for assistant responses.

## Status

**Prototype, not yet confirmed as a production embed target.** This was built to validate that Headwind UI's public package produces a theme-accurate chat surface standalone — it does not yet have access to CityLaw NG's internal `@clng/utilities/theme/themeMode` module or its monorepo build config (`tailwind.config.js`, font loading via `next/font`). See [Stand-ins](#stand-ins-for-internal-modules) below for what's approximated and why.

Whether this becomes the real CityLaw NG chat feature (built inside their repo) or stays a standalone reference app is an open question — not decided by this codebase.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build
npm run lint    # oxlint
```

## What's implemented

| Chat part | Component |
|---|---|
| Composer | `HWTextarea` + `HWButton` — Enter to send, Shift+Enter for a newline |
| Message card | `HWSurface` |
| Streaming placeholder | `HWSkeleton` |
| Typing indicator | Custom, built on `transitions.pulse` (not `animate-pulse` — see brief's reduced-motion trap) |
| Empty transcript | `HWEmptyState` |
| Citations | `HWChip` |
| Copy action | Custom, following the copy-button contract documented for `HWFieldDisplay` (§7.23 of the agent guide) |
| Error / retry | `HWBanner` (`variant="danger"`) |
| Feedback | `hwToast` + `HWToaster` |

The chat itself runs on a mocked, client-side streaming simulation (`App.tsx`) — there is no backend wired up yet.

## Stand-ins for internal modules

| Real CityLaw NG module | What this repo uses instead | Why |
|---|---|---|
| `@clng/utilities/theme/themeMode` | `src/theme/themeMode.ts` | Internal path alias, not part of the public `headwindui` package — this file mirrors its documented function signatures so swapping the import later is a one-line change, not a rewrite. |
| `tailwind.config.js` + `@config` | `@custom-variant dark (&:where(.dark, .dark *))` in `index.css` | Pure Tailwind v4 dark-mode wiring, since we don't have their retained v3-style config. |
| `next/font/google` (Inter, Azeret Mono) | Google Fonts `@import` in `index.css` | This is a Vite app, not Next.js — same fonts, loaded the Vite-compatible way. |

## Dependency versions

Pinned exactly (not `^`) to the versions in the theming brief, to avoid the "works in my sandbox" drift the brief warns about: `headwindui@1.5.2`, `tailwindcss@4.3.2`, `@headlessui/react@2.2.10`, `motion@12.42.2`, `react`/`react-dom@19.2.7`.
