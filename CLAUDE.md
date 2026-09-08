# AbabilX Chat (web)

Open-source Next.js client for AbabilX messaging: personal + workspace chat, E2EE, 1:1 and group calls.

**This is the home of web chat.** From 2026-09-09, every chat-related change on
the web is made here — messages and conversations, composer and timeline, E2EE
and the vault screens, calls, connections/People, chat settings. Not in
`../../Ababil-X-frontend/`, which still carries a pre-split **copy** of
`src/components/team/messages/` that nothing keeps in sync: the two are separate
trees, not a shared package, so a change made there never arrives here and a
change made here never arrives there. If a chat fix appears to be missing, check
which tree it landed in before rewriting it.

Everything that is not chat — repositories, standup rules, auto-commit, weekly
digest, PR review, CRM, admin, workspace pages — stays in `Ababil-X-frontend/`.

The monorepo's product overview, the full API endpoint list, the DB table map
and the long-form chat design notes (E2EE, retention, Note to Self, message
requests) live in the root `../../CLAUDE.md`. Read that before changing chat
behaviour; this file is only what it does not say.

**Check**: `bunx tsc --noEmit`. `bunx eslint src/components/team/messages`
reports two pre-existing ref-during-render errors in
`chat-timeline/use-timeline-scroll.ts` — they predate the split and are present
in both trees, so a clean eslint run is not the bar.

## Layout

- `src/app/**/page.tsx` — Server Components only. They compose feature folders.
- `src/components/auth/login-page/` — login screen (`index.tsx` + parts)
- `src/components/user-shell/` — signed-in chrome + call/chat providers
- `src/components/team/messages/` — chat UI (copied from Ababil-X-frontend)

## Run

```bash
cp .env.example .env.local
bun install
bun run dev
```

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` in `.env.local`.
