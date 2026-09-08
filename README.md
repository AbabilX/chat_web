# AbabilX Chat

Next.js messaging client for the AbabilX chat server. Pages stay Server Components; interactive UI lives in `src/components/**/index.tsx` folders.

## Getting started

```bash
cp .env.example .env.local
bun install
bun run dev
```

Fill `.env.local` from `.env.example`, then open the URL Next prints.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Login (Google or phone QR) |
| `/auth/google/callback` | Google OAuth return |
| `/user/messages` | Personal + workspace chat |
| `/user/workspace/messages` | Same chat, workspace-gated |

## Structure

```
src/app/**/page.tsx          # server — compose only
src/components/auth/         # login + OAuth callbacks
src/components/user-shell/   # session, calls, notifications
src/components/team/messages # chat screens
src/lib/api                  # HTTP client
src/lib/chat-e2ee            # device identity + recovery
src/lib/calls                # WebRTC / ringtone
```
