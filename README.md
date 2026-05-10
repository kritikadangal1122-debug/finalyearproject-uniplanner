# Stitch / UniPlanner — Local Development

Quick guide to run the app locally or via a VS Code Dev Container.

Prerequisites
- Docker (if using the devcontainer) or Node.js >= 16 and npm installed locally.

Local (native) development
1. Install deps:
```powershell
npm install
```
2. Start both servers:
```powershell
npm run dev
```
3. Open the client: http://localhost:3000 (Vite) — backend is on http://localhost:4000

Using the VS Code Dev Container
1. Open this folder in VS Code.
2. When prompted, reopen in container (or use the Remote - Containers command).
3. Devcontainer runs `npm ci` after creation. Then in the container terminal:
```bash
npm run dev
```

Notes
- The Vite client proxies `/api` to `http://127.0.0.1:4000` for local dev.
- If you prefer running servers separately:
  - `npm run dev:server` starts the API on port 4000
  - `npm run dev:vite` starts the client (Vite)
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aec90ecd-eb12-4c87-9bd2-87c914af139f

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Optionally set the `GEMINI_API_KEY` in [.env.local](.env.local) for Gemini-powered features.
3. Start the full stack:
   `npm run dev`

### What `npm run dev` starts

- Vite frontend on `http://localhost:3000`
- Learning OS API on `http://localhost:4000`
- API proxying from `/api` through Vite for local development

### Backend Notes

- Authentication uses JWT-style session tokens.
- Persistent app state is written to `server/data/learning-os.json`.
- Architecture reference: [docs/learning-os-architecture.md](docs/learning-os-architecture.md)
- API reference: [docs/learning-os-api.md](docs/learning-os-api.md)
