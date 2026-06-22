# Task Management Application

Full-stack task manager built with **Rails 8**, **GraphQL**, **React + TypeScript**, **SQLite**, and an **AI task assistant** powered by Groq.

**Production demo:** API on [Fly.io](https://fly.io) + frontend on [Vercel](https://vercel.com). See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions.

---

## For Reviewers — Start Here

Follow these steps in order. No guesswork required.

### What you need installed

| Tool | Required? | Notes |
|------|-----------|-------|
| [Docker Desktop](https://docs.docker.com/get-docker/) | **Yes** | Runs Rails API and Vite frontend (SQLite file, no separate DB container) |
| [Node.js 20+](https://nodejs.org/) | **Yes (for E2E only)** | Cypress runs on your machine, not inside Docker |
| [Groq API key](https://console.groq.com) | Optional | Full AI assistant; without it, search falls back to plain text |
| Make | Optional | All commands also work via `npm` (recommended on Windows) |

### Step 1 — Configure environment

From the project root:

```bash
cp .env.example .env
```

Open `.env` and set your Groq key if you want full AI behavior:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> **Without a Groq key:** the app still runs. Priority defaults to `medium` on create, and the assistant only performs plain text search (no create/complete/delete via natural language).

### Step 2 — Start the application

**Option A — Foreground (recommended for review)**  
Logs stream in the terminal; hot reload is enabled.

```bash
npm run dev
```

**Option B — Background**

```bash
npm run dev:detached
npm run dev:logs   # follow API + frontend logs
```

**Option C — First-time setup with sample data**

```bash
npm run setup
```

This starts Docker, runs migrations, and seeds 6 sample tasks (including *Fix authentication bug*).

Wait until you see:

- API: `Listening on http://0.0.0.0:3000`
- Client: `Local: http://localhost:5173/`

| Service | URL |
|---------|-----|
| **Frontend (open this)** | http://localhost:5173 |
| GraphQL API | http://localhost:3000/graphql |
| Health check | http://localhost:3000/up |

### Step 3 — Verify the stack is healthy

```bash
curl http://localhost:3000/up
```

Expected: HTTP `200`.

Open http://localhost:5173 — you should see the task board with the AI assistant at the top.

### Step 4 — Manual walkthrough (5 minutes)

Use this checklist to exercise the main features:

#### A. Task CRUD (UI)

1. **Create** — fill in title/description in the form below the assistant and click **Create Task**.
2. **Edit** — click the pencil icon on a task, change title/description, save.
3. **Complete** — click the check icon; task moves to Completed when filtered.
4. **Reopen** — on a completed task, click reopen; it returns to Pending.
5. **Delete** — click the trash icon; task is removed.
6. **Filter** — use **All / Pending / Completed** tabs above the task list.

Each task shows its **Added** date (US format) and priority badge.

#### B. AI priority inference (create form)

1. Create a task with title `"Fix production outage"` and leave priority on **Auto**.
2. The API infers **high** priority from the text (requires `GROQ_API_KEY`, otherwise defaults to `medium`).

#### C. AI Task Assistant (requires `GROQ_API_KEY`)

Type commands in the assistant bar and press **Run**:

| Command | Expected result |
|---------|-----------------|
| `show authentication tasks` | Filters list to tasks matching "authentication" |
| `create task Review pull request` | Creates a new pending task |
| `create 3 tasks: buy keyboard, go to gym, pick up kids` | Creates three tasks |
| `complete authentication task` | Marks matching task(s) as done |
| `delete old docs task` | Deletes matching task(s) |

After a **search** command, the UI applies returned filters automatically. After **create/complete/delete**, the list refreshes.

#### D. GraphQL playground (optional)

POST to http://localhost:3000/graphql:

```graphql
query {
  tasks(status: "pending") {
    id
    title
    priority
    addedAt
  }
}
```

### Step 5 — Run the test suite

**Keep the Docker stack running** (`npm run dev` or `npm run dev:detached`) before E2E tests.

From the **project root**:

```bash
# Backend only (38 Minitest tests)
npm run test:api

# Cypress E2E only (7 tests — requires stack + Node on host)
npm run test:e2e

# Both
npm run test:all
```

**Expected output:**

- `npm run test:api` → `38 runs, 0 failures`
- `npm run test:e2e` → `7 passing`

On macOS/Linux with Make installed, equivalent commands:

```bash
make test-api
make test-e2e
make test-all
```

### Step 6 — Stop the application

```bash
npm run dev:down
# or: docker compose down
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API exits with "A server is already running" | Stale PID file. Run `npm run dev:down`, then `npm run dev` again. The entrypoint removes stale PIDs automatically. |
| Frontend shows "Failed to load tasks" | API not ready yet. Wait ~30s after `npm run dev`, or check `docker compose logs api`. |
| AI assistant only searches, never creates | Set `GROQ_API_KEY` in `.env` and restart: `npm run dev:down && npm run dev`. |
| Cypress cannot reach app | Stack must be running; frontend must be at http://localhost:5173. |
| Port already in use | Stop other services on ports `3000` or `5173`. |
| Windows: `make` not found | Use `npm run …` commands from the root `package.json` instead. |

---

## What Was Implemented

| Area | Details |
|------|---------|
| **GraphQL API** | `tasks` query + CRUD mutations + `executeTaskAssistant` |
| **Task model** | Title, description, completed, priority (`low`/`medium`/`high`), timestamps |
| **AI priority** | Inferred on create when priority is omitted |
| **AI assistant** | Natural language search, create, complete, delete (Groq via RubyLLM) |
| **Prompt safety** | Input sanitized; AI output validated against whitelists; safe fallbacks |
| **React UI** | Task board, assistant bar, create/edit form, status filters, error states |
| **Docker** | One-command dev environment (api + client, SQLite) |
| **Deploy** | Fly.io (API) + Vercel (frontend) — see [DEPLOY.md](DEPLOY.md) |
| **Tests** | 38 Minitest + 7 Cypress E2E |
| **Docs** | This README |

---

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Rails 8.1 (API-only) |
| API | GraphQL (`graphql-ruby`) |
| Database | SQLite (local file + Fly.io volume in production) |
| AI | Groq via RubyLLM + structured JSON output |
| Frontend | React 19, TypeScript, Vite, Apollo Client, Tailwind, shadcn/ui |
| E2E Tests | Cypress |
| Backend Tests | Minitest |

## Architecture

```text
React Client  →  GraphQL API  →  Rails Resolvers  →  ActiveRecord  →  SQLite
                                    ↓
                          TaskAssistantService / AiService
                                    ↓
                              Ai::LlmClient (Groq)
```

- **GraphQL-only API** — all communication through `/graphql`
- **Rails-native** — resolvers call models and service objects directly
- **AI abstraction** — business logic uses service objects; Groq is swappable via env
- **Security** — user input is untrusted; AI outputs are validated before use

## Docker Services

```text
docker-compose.yml
├── api      → Rails + GraphQL + SQLite (port 3000)
└── client   → Vite dev server (port 5173)
```

The API container installs gems, runs `db:prepare`, removes stale PID files, and starts the server. Data is stored in `api/storage/*.sqlite3`.

## Deployment (Fly.io + Vercel)

| Layer | Platform | Notes |
|-------|----------|-------|
| Frontend | **Vercel** | Static Vite build; set `VITE_GRAPHQL_URL` to your Fly URL |
| API | **Fly.io** | Docker image from `Dockerfile.fly`; SQLite on a Fly volume |
| Database | **SQLite** | `/data/*.sqlite3` on Fly volume — fine for demos, not for multi-replica prod |

Full walkthrough: **[DEPLOY.md](DEPLOY.md)**

Quick summary:

```bash
# API
fly launch --no-deploy    # or edit fly.toml, then:
fly volumes create data --region gru --size 1
fly secrets set RAILS_MASTER_KEY="$(cat api/config/master.key)" GROQ_API_KEY=... CORS_ORIGINS=https://your-app.vercel.app
fly deploy

# Frontend — import repo on Vercel, root directory: client
# Env: VITE_GRAPHQL_URL=https://YOUR-APP.fly.dev/graphql
```

## Environment Variables

Copy [`.env.example`](.env.example):

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Groq API key ([get one here](https://console.groq.com)) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model name |
| `AI_PROVIDER` | `groq` | Active AI provider |
| `VITE_GRAPHQL_URL` | `/graphql` | Frontend GraphQL endpoint (proxied to API in dev) |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated origins allowed to call the API |

Docker Compose passes `GROQ_*` vars from `.env` into the `api` container automatically.

## Commands Reference

### npm (works everywhere, including Windows)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start api + client (foreground, live logs) |
| `npm run dev:detached` | Start all services in background |
| `npm run dev:down` | Stop containers |
| `npm run dev:logs` | Follow API + frontend logs |
| `npm run setup` | Start stack, migrate, and seed sample tasks |
| `npm run test:api` | Run backend Minitest suite |
| `npm run test:e2e` | Run Cypress E2E (stack must be running) |
| `npm run test:all` | Run API + E2E tests |

### Make (macOS / Linux)

| Command | Description |
|---------|-------------|
| `make dev` | Same as `npm run dev` |
| `make up` | Start in background |
| `make down` | Stop containers |
| `make setup` | Migrate + seed |
| `make test-api` | Backend tests |
| `make test-e2e` | Cypress tests |
| `make test-all` | Both test suites |
| `make logs-all` | Follow logs |
| `make shell` | Bash shell in API container |

## AI Features

### Task Priority Inference

When creating a task without specifying priority, the API infers `low`, `medium`, or `high` from the title and description.

```graphql
mutation {
  createTask(input: { title: "Fix production outage", description: "Users cannot log in" }) {
    task { id title priority }
    errors
  }
}
```

Explicit priority skips AI:

```graphql
mutation {
  createTask(input: { title: "Chore", priority: LOW }) {
    task { priority }
  }
}
```

### AI Task Assistant

Uses [RubyLLM](https://rubyllm.com/) with Groq (`json_object` response format). Returns a typed payload with `action`, `targets`, `status`, and `priority`.

```graphql
mutation {
  executeTaskAssistant(input: { query: "create task Review pull request" }) {
    action
    message
    tasks { id title completed priority }
    filters { status priority search }
    errors
  }
}
```

Example commands:

- `"show high priority authentication tasks"` → search with filters
- `"create task Deploy staging"` → creates a new task
- `"create 3 tasks: buy keyboard, go to gym and pick up kids"` → creates 3 tasks
- `"complete authentication task"` → marks matching tasks as done
- `"delete old docs task"` → removes matching tasks

Without `GROQ_API_KEY`, the assistant falls back to plain text search only.

### Prompt Injection Protection

- User input is wrapped as data in prompts — never executed as instructions
- Structured JSON output enforced via RubyLLM
- All values validated against whitelists (`low`/`medium`/`high`, `all`/`pending`/`completed`)
- Invalid AI output falls back to plain text search
- Input text is sanitized (HTML stripped, length capped)

## GraphQL API

### Queries

```graphql
query {
  tasks(status: "pending", priority: "high", search: "auth") {
    id
    title
    description
    completed
    priority
    addedAt
    createdAt
    updatedAt
  }
}
```

`status`: `all`, `pending`, `completed` (or omit for all)  
`priority`: `all`, `low`, `medium`, `high` (or omit for all)

### Mutations

Available: `createTask`, `updateTask`, `completeTask`, `reopenTask`, `deleteTask`, `executeTaskAssistant`.

```graphql
mutation {
  createTask(input: { title: "Example", description: "Example" }) {
    task { id title completed priority }
    errors
  }
}

mutation {
  executeTaskAssistant(input: { query: "complete authentication task" }) {
    action
    message
    tasks { id title completed }
    errors
  }
}
```

## Frontend Layout

Top to bottom on http://localhost:5173:

1. **AI Assistant** — natural language commands
2. **Create Task** form — title, description, optional priority (Auto uses AI)
3. **Status filters** — All / Pending / Completed
4. **Task list** — edit, complete, reopen, delete actions

## Project Structure

```text
.
├── api/
│   ├── app/graphql/          # GraphQL schema, queries, mutations
│   ├── app/models/           # Task model
│   ├── app/services/         # AiService, TaskAssistantService, AI layer
│   └── test/                 # Minitest (38 tests)
├── client/
│   ├── src/components/tasks/ # UI components
│   ├── src/hooks/            # Apollo hooks
│   └── cypress/e2e/          # E2E tests (7 tests)
├── docker-compose.yml
├── Dockerfile              # Local dev (Docker Compose)
├── Dockerfile.fly          # Production (Fly.io)
├── fly.toml
├── DEPLOY.md               # Fly.io + Vercel guide
├── Makefile
├── package.json              # Root npm scripts (dev, test)
└── .env.example
```

## Local Development (without Docker)

### Backend

```bash
cd api
bundle install
export GROQ_API_KEY=your_key
bin/rails db:prepare
bin/rails server
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Vite proxies `/graphql` to `http://localhost:3000`.
