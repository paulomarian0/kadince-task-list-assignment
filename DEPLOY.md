# Deployment Guide (Fly.io + Vercel + SQLite)

This project uses **SQLite** locally and on Fly.io (with a persistent volume). The frontend is a static Vite build on **Vercel**.

> **Demo / take-home:** This setup is intentional — cheap, simple, and good enough for reviewers. For production at scale you would use PostgreSQL and managed services.

## Architecture

```text
Vercel (React static)  →  Fly.io (Rails GraphQL API)  →  SQLite on Fly volume (/data)
```

---

## Part 1 — Deploy the API to Fly.io

### Prerequisites

- [Fly.io account](https://fly.io) + [flyctl installed](https://fly.dev/docs/flyctl/install/)
- `api/config/master.key` on your machine (not committed to git)

### Steps

1. **Log in**

```bash
fly auth login
```

2. **Create the app** (pick a unique name)

```bash
fly apps create kadince-task-list-api
```

Update `app = "..."` in [`fly.toml`](../fly.toml) if you used a different name.

3. **Create a persistent volume** (SQLite lives here)

```bash
fly volumes create data --region gru --size 1
```

4. **Set secrets**

```bash
fly secrets set RAILS_MASTER_KEY="$(cat api/config/master.key)"
fly secrets set GROQ_API_KEY="your_groq_key"
fly secrets set CORS_ORIGINS="https://YOUR-APP.vercel.app"
```

Optional:

```bash
fly secrets set GROQ_MODEL="llama-3.3-70b-versatile"
fly secrets set SEED_ON_BOOT="true"
```

5. **Deploy**

From the project root:

```bash
fly deploy
```

6. **Verify**

```bash
fly open /up
curl https://kadince-task-list-api.fly.dev/up
```

Your GraphQL endpoint:

```text
https://kadince-task-list-api.fly.dev/graphql
```

### Fly.io notes

- **Free tier:** machines sleep when idle; first request may take ~10–30s (cold start).
- **SQLite volume:** data persists across deploys on the same volume.
- **Single instance:** SQLite is not ideal for multiple API replicas — use one machine for demos.
- **Logs:** `fly logs`

---

## Part 2 — Deploy the frontend to Vercel

### Prerequisites

- [Vercel account](https://vercel.com)
- Repo pushed to GitHub

### Steps

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.

2. Configure the project:

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

3. Add environment variable:

| Name | Value |
|------|-------|
| `VITE_GRAPHQL_URL` | `https://kadince-task-list-api.fly.dev/graphql` |

Use your actual Fly.io URL.

4. Deploy.

5. **Update Fly CORS** with your Vercel URL:

```bash
fly secrets set CORS_ORIGINS="https://your-app.vercel.app"
```

Redeploy is not required for secret changes (app restarts automatically).

6. Open your Vercel URL and test create / AI assistant / filters.

---

## Part 3 — Local development (unchanged workflow)

```bash
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3000/graphql  
- Database: `api/storage/development.sqlite3` (SQLite file, no Postgres container)

---

## Environment variables reference

### Local (`.env`)

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | AI assistant + priority inference |
| `CORS_ORIGINS` | Allowed frontend origins (optional locally) |
| `VITE_GRAPHQL_URL` | GraphQL URL for Vite (`/graphql` in Docker dev) |

### Fly.io (`fly secrets set`)

| Secret | Required | Purpose |
|--------|----------|---------|
| `RAILS_MASTER_KEY` | Yes | Decrypt Rails credentials |
| `GROQ_API_KEY` | Recommended | Full AI features |
| `CORS_ORIGINS` | Yes (prod) | Your Vercel URL |

### Vercel

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_GRAPHQL_URL` | Yes | Fly.io GraphQL URL (absolute) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Set `CORS_ORIGINS` on Fly to exact Vercel URL (no trailing slash) |
| API 502 / cold start | Wait 30s and retry; or set `min_machines_running = 1` in `fly.toml` (not free) |
| Empty task list after deploy | Run `fly ssh console -C "bin/rails db:seed"` or set `SEED_ON_BOOT=true` |
| `Missing RAILS_MASTER_KEY` | `fly secrets set RAILS_MASTER_KEY="$(cat api/config/master.key)"` |
| AI only searches | Set `GROQ_API_KEY` on Fly |

---

## Rollback / destroy

```bash
fly apps destroy kadince-task-list-api
```

Delete the Vercel project from the Vercel dashboard.
