# Task Management Application

A full-stack task management app built with **Ruby on Rails**, **GraphQL**, **React + TypeScript**, and **PostgreSQL**. The API is GraphQL-only (no REST endpoints). AI features are powered by **Groq** through a provider-agnostic abstraction layer.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Rails 8.1 (API-only) |
| API | GraphQL (`graphql-ruby`) |
| Database | PostgreSQL 16 |
| AI | Groq (via `AiService` abstraction) |
| Frontend | React 19, TypeScript, Vite, Apollo Client, Tailwind, shadcn/ui |
| E2E Tests | Cypress |
| Backend Tests | Minitest |

## Architecture

```text
React Client  →  GraphQL API  →  Rails Resolvers  →  ActiveRecord  →  PostgreSQL
                                    ↓
                               AiService (facade)
                                    ↓
                            GroqProvider (swappable)
```

- **GraphQL-only API** — all communication through `/graphql`
- **Rails-native** — resolvers call models and service objects directly (no repository/use-case layers)
- **AI abstraction** — business logic uses `AiService`; Groq is only the current provider implementation
- **Security** — user input is treated as untrusted data; AI outputs are validated against whitelists before use

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Make](https://www.gnu.org/software/make/) (optional; on Windows use `docker compose` commands directly)
- [Groq API key](https://console.groq.com) (optional — app works without it using fallbacks)

## Quick Start

1. Copy environment file and add your Groq key (optional):

```bash
cp .env.example .env
# Edit .env and set GROQ_API_KEY=...
```

2. Start the full stack:

**Recommended for development** — logs from API and frontend stream in your terminal, with hot reload:

```bash
npm run dev
# or: make dev
```

Start in the background (detached):

```bash
make up
# or: npm run dev:detached
```

Or full setup with migrations and seed data:

```bash
make setup
```

### Hot reload

| Layer | Behavior |
|-------|----------|
| **Frontend (Vite)** | HMR via volume mount; polling enabled in Docker for reliable reload on Windows |
| **Backend (Rails)** | Code reloads on each request in development (`config.enable_reloading = true`) |

When running detached (`make up`), follow logs with `make logs-all` or `npm run dev:logs`.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL API | http://localhost:3000/graphql |
| Health check | http://localhost:3000/up |

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start db + api + client in foreground (live logs, hot reload) |
| `make up` | Build and start all services in background |
| `make down` | Stop containers |
| `make setup` | Start stack, migrate, and seed |
| `make migrate` | Run database migrations |
| `make seed` | Load sample tasks |
| `make test` / `make test-api` | Run backend Minitest suite |
| `make test-e2e` | Run Cypress tests (stack must be running) |
| `make restart` | Restart API container |
| `make restart-all` | Restart all containers |
| `make logs` | Follow API logs |
| `make logs-client` | Follow frontend logs |
| `make logs-all` | Follow API + frontend logs |
| `make shell` | Bash shell in API container |

On Windows without Make, use the equivalent `docker compose` commands from the table above.

## Docker Architecture

```text
docker-compose.yml
├── db       → PostgreSQL 16 (port 5432)
├── api      → Rails + GraphQL (port 3000)
└── client   → Vite dev server (port 5173)
```

The API container automatically waits for PostgreSQL, installs gems, runs `db:prepare`, and starts the server.

## Environment Variables

Copy [`.env.example`](.env.example):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://postgres:postgres@db:5432/api_development` | PostgreSQL connection |
| `GROQ_API_KEY` | — | Groq API key ([get one here](https://console.groq.com)) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model name |
| `AI_PROVIDER` | `groq` | Active AI provider |
| `VITE_GRAPHQL_URL` | `/graphql` | Frontend GraphQL endpoint |

**Without `GROQ_API_KEY`:** priority defaults to `medium` on create; NL search falls back to plain text search.

## AI Features

### 1. Task Priority Inference

When creating a task without specifying priority, `AiService` infers `low`, `medium`, or `high` from the title and description.

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

### 2. AI Task Assistant

The assistant uses [RubyLLM](https://rubyllm.com/) with structured JSON schemas (`ruby_llm-schema`) via Groq. It returns a typed payload with `action`, `targets`, `status`, and `priority`.

Use plain language to search, create, complete, or delete tasks:

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

For search commands, the frontend applies returned filters to the task list automatically.

### Prompt Injection Protection

- User input is wrapped as `USER_DATA` in prompts — never executed as instructions
- Structured output is enforced with JSON schemas via RubyLLM
- All values are validated against whitelists (`low`/`medium`/`high`, `all`/`pending`/`completed`)
- Invalid AI output falls back to plain text search
- Input text is sanitized (HTML stripped, length capped)

## GraphQL API

### Queries

```graphql
# List tasks with filters
query {
  tasks(status: "pending", priority: "high", search: "auth") {
    id
    title
    description
    completed
    priority
    createdAt
    updatedAt
  }
}
```

`status`: `all`, `pending`, `completed` (or omit for all)  
`priority`: `all`, `low`, `medium`, `high` (or omit for all)

### Mutations

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

Available: `createTask`, `updateTask`, `completeTask`, `reopenTask`, `deleteTask`, `executeTaskAssistant`.

## Frontend Usage

1. Open http://localhost:5173
2. Use **AI Assistant** for natural language commands (search, create, complete, delete)
3. Filter by **status** (All / Pending / Completed) and **priority** (All / Low / Medium / High)
4. Create tasks — leave priority as "Auto" for AI inference, or pick explicitly
5. Edit, complete, reopen, or delete tasks from the list

## Running Tests

### Backend

```bash
make test-api
```

Covers GraphQL CRUD, priority filters, AI service validation (stubbed), and `executeTaskAssistant`.

### Frontend (Cypress)

```bash
make test-e2e
```

## Project Structure

```text
.
├── api/
│   ├── app/graphql/          # GraphQL schema
│   ├── app/models/           # Task model
│   ├── app/services/         # AiService + AI providers
│   └── test/                 # Minitest
├── client/
│   ├── src/components/tasks/ # UI components
│   ├── src/hooks/            # Apollo hooks
│   └── cypress/e2e/          # E2E tests
├── docker-compose.yml
├── Dockerfile
├── Makefile
└── .env.example
```

## Local Development (without Docker)

### Backend

```bash
cd api
bundle install
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/api_development
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
