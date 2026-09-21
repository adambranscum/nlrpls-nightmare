# TODO

## Before first use
- [ ] `npm install` in both `backend/` and `frontend/`
- [ ] Fill in `backend/.env` (SITE_PASSWORD especially — pick something real)
- [ ] Fill in `frontend/.env` (BACKEND_URL)
- [ ] Confirm LM Studio is running and reachable at LMSTUDIO_URL
- [ ] Confirm the model name in LMSTUDIO_MODEL matches what's loaded in LM Studio
- [ ] Drop config files into `backend/data/configs/`
- [ ] Run `npm run ingest` in backend

## Deployment on the Mac mini
- [ ] Decide static IP / hostname for the Mac mini on the LAN
- [ ] Set up DNS: nightmare.nlrlibrary.org -> Mac mini's IP
- [ ] Reverse proxy (Caddy recommended — auto HTTPS) in front of frontend (port 3000)
- [ ] Turn on `secure: true` for the session cookie once HTTPS is live
- [ ] Process manager for backend + frontend (pm2 or launchd) so they survive reboots

## Nice-to-haves later
- [ ] Swap brute-force cosine similarity for sqlite-vec (faster at scale)
- [ ] Per-user logins instead of one shared password
- [ ] File upload UI instead of manually dropping files into data/configs
- [ ] Streaming responses instead of waiting for the full answer
