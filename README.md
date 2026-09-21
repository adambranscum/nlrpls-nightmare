# nlrpls-nightmare

Internal IT reference agent for NLRPLS. Answers simple IT questions using
your team's config files as source material. Password-protected, LAN-accessible.

Future DNS: `nightmare.nlrlibrary.org`

## Layout

```
nlrpls-nightmare/
├── backend/            Express API — RAG query, ingestion, LM Studio wiring
│   ├── src/
│   │   ├── routes/     chat.js, ingest.js, health.js
│   │   ├── lib/        embeddings.js, search.js, lmstudio.js, db.js
│   │   └── middleware/ auth.js
│   ├── data/
│   │   ├── configs/    <- drop your config files here (.md, .txt, .conf, .json etc.)
│   │   └── nightmare.db  (created automatically by ingest script)
│   ├── scripts/
│   │   └── ingest.js   chunk + embed + store everything in data/configs
│   ├── .env.example
│   └── package.json
│
├── frontend/           Next.js chat UI
│   ├── app/
│   │   ├── page.jsx        main chat screen
│   │   ├── login/          password gate
│   │   └── api/chat/       proxies to backend (keeps backend off the public LAN if desired)
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── docs/                notes, deployment plan, DNS/reverse proxy TODOs
```

## Setup (once you're on the Mac mini)

1. `cd backend && npm install`
2. Copy `.env.example` to `.env`, fill in `SITE_PASSWORD`, `LMSTUDIO_URL`, `SESSION_SECRET`
3. Drop your config files into `backend/data/configs/`
4. `npm run ingest` — chunks and embeds everything into `data/nightmare.db`
5. `npm run dev` — starts the API (default port 4000)
6. `cd ../frontend && npm install && npm run dev` — starts the chat UI (default port 3000)

## Not yet wired up (see docs/TODO.md)

- sqlite-vec vector search (currently a placeholder — falls back to keyword match)
- LM Studio endpoint confirmed against your actual model
- HTTPS + reverse proxy for `nightmare.nlrlibrary.org`
- Multi-user auth (currently single shared password)
