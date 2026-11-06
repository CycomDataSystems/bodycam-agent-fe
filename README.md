# bodycam-agent-fe — chat prototype

A chat interface built on **Headwind UI** (`@cycomdatasystems/headwindui@1.5.2`), following the conventions in CityLaw NG's front-end theming brief (18 Sep 2026): cascade-layer order, `hw-*` design tokens, dark-mode wiring, scroll/z-index conventions, and the `.tiptap` rich-text scale for assistant responses. Integrated against the real LegalEdge judicial-agent backend — not a mock.

## Status

**Prototype, not yet confirmed as a production embed target.** This was built to validate that Headwind UI's public package produces a theme-accurate chat surface standalone — it does not yet have access to CityLaw NG's internal `@clng/utilities/theme/themeMode` module or its monorepo build config (`tailwind.config.js`, font loading via `next/font`). See [Stand-ins](#stand-ins-for-internal-modules) below for what's approximated and why.

Whether this becomes the real CityLaw NG chat feature (built inside their repo) or stays a standalone reference app is an open question — not decided by this codebase.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in real values — see below
npm run dev     # http://localhost:5173
npm run build   # production build
npm run lint    # oxlint
```

## Environment variables

See `.env.example`. `VITE_JUDICIAL_API_URL` is the real backend; `VITE_TOKEN_LAMBDA_URL` is Sara's token-issuing Lambda (the normal auth path — see `src/api/tokenLambda.ts` and `src/api/auth.ts`). `VITE_DEV_JWT` is a manual override for edge-case debugging only, bypassing the Lambda entirely.

## Testing against the real backend

- **CORS on the browser side is a known, currently-open blocker** (as of 2026-11-05): the judicial-agent backend's `ALLOWED_ORIGINS` wasn't splitting multiple origins correctly, so `http://localhost:5173` gets blocked by the browser even though the backend itself works (confirmed via direct `curl`, bypassing CORS). Sara has the fix written; it's pending deployment to the production container. Browser testing won't succeed until that's deployed — check with her before assuming something here is broken.
- **Test login:** use `admin` at the login gate. This is a real `user_id` (not a `role` escalation — the frontend always sends `role: "user"` regardless of which `user_id` is used, per the security note in `src/api/tokenLambda.ts`) with legitimate permissions over CriminalCase/MISDEM-type cases, including `06-47400`. Confirmed end-to-end (token → `/judicial/agent` → 200 with a real case summary) via direct `curl`, independent of the browser's CORS blocker above.
- Sample query to try once CORS is deployed: *"Give me a case summary for case 06-47400"*.

## What's implemented

| Chat part | Component |
|---|---|
| Login gate | Custom (`LoginGate.tsx`) — stopgap identity collection, not real auth; see `src/auth/session.ts` |
| Composer | `HWTextarea` (auto-grows with content up to ~6-7 lines, then scrolls internally) + `HWButton` — Enter to send, Shift+Enter for a newline |
| File attachment | Custom — attach button, removable `HWChip` preview, sent as `file` in the real request |
| Message card | `HWSurface` |
| Streaming placeholder | `HWSkeleton` |
| Typing indicator | Custom, built on `transitions.pulse` (not `animate-pulse` — see brief's reduced-motion trap) |
| Empty transcript | `HWEmptyState` |
| Citations | `HWChip` |
| Copy action | Custom, following the copy-button contract documented for `HWFieldDisplay` (§7.23 of the agent guide) |
| Error / retry | `HWBanner` (`variant="danger"`) — retry resends the original text and attachment |
| Feedback | `hwToast` + `HWToaster` |
| Timestamps | Shown per message, formatted via `toLocaleTimeString` |

The real backend call lives in `src/api/judicialAgent.ts` (single-shot request/response — the backend doesn't token-stream, so the typing indicator covers the wait rather than faking a stream).

## Known backend quirks worth knowing before debugging further

- The actual judicial-agent request/response is single-shot, not streamed — don't mistake a slow response for a broken connection.
- A timeout with no HTTP status at all (not even a 4xx/5xx) from the judicial-agent backend (`3.91.38.137:8000`) has historically meant an IP isn't allowlisted on that server's security group — this looks identical to a CORS block in some contexts but is a different cause. Direct `curl` from an allowlisted IP bypasses CORS entirely and is the fastest way to tell which one you're hitting.

## Stand-ins for internal modules

| Real CityLaw NG module | What this repo uses instead | Why |
|---|---|---|
| `@clng/utilities/theme/themeMode` | `src/theme/themeMode.ts` | Internal path alias, not part of the public `headwindui` package — this file mirrors its documented function signatures so swapping the import later is a one-line change, not a rewrite. |
| `tailwind.config.js` + `@config` | `@custom-variant dark (&:where(.dark, .dark *))` in `index.css` | Pure Tailwind v4 dark-mode wiring, since we don't have their retained v3-style config. |
| `next/font/google` (Inter, Azeret Mono) | Google Fonts `@import` in `index.css` | This is a Vite app, not Next.js — same fonts, loaded the Vite-compatible way. |

## Dependency versions

Pinned exactly (not `^`) to the versions in the theming brief, to avoid the "works in my sandbox" drift the brief warns about: `headwindui@1.5.2`, `tailwindcss@4.3.2`, `@headlessui/react@2.2.10`, `motion@12.42.2`, `react`/`react-dom@19.2.7`.
