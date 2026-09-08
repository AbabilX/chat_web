# AbabilX Chat (web)

Open-source Next.js client for AbabilX messaging: personal + workspace chat, E2EE, 1:1 and group calls.

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
