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

```bash
make up
```

Or full setup with migrations and seed data:

```bash
make setup
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL API | http://localhost:3000/graphql |
| Health check | http://localhost:3000/up |

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make up` | Build and start all services |
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

### 2. Natural Language Search

Convert plain-language queries into structured filters:

```graphql
query {
  parseTaskSearch(query: "show me high priority authentication tasks") {
    status
    priority
    search
  }
}
```

Example response:

```json
{
  "status": "all",
  "priority": "high",
  "search": "authentication"
}
```

The frontend applies these filters to the `tasks` query automatically.

### Prompt Injection Protection

- User input is wrapped as `USER_DATA` in prompts — never executed as instructions
- AI must return JSON only
- All values are validated against whitelists (`low`/`medium`/`high`, `all`/`pending`/`completed`)
- Invalid AI output triggers safe fallbacks
- Search text is sanitized (HTML stripped, length capped)

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

# Parse natural language into filters
query {
  parseTaskSearch(query: "completed low priority docs") {
    status
    priority
    search
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
```

Available: `createTask`, `updateTask`, `completeTask`, `reopenTask`, `deleteTask`.

## Frontend Usage

1. Open http://localhost:5173
2. Use **AI Search** for natural language queries (e.g. "high priority authentication tasks")
3. Filter by **status** (All / Pending / Completed) and **priority** (All / Low / Medium / High)
4. Create tasks — leave priority as "Auto" for AI inference, or pick explicitly
5. Edit, complete, reopen, or delete tasks from the list

## Running Tests

### Backend

```bash
make test-api
```

Covers GraphQL CRUD, priority filters, AI service validation (stubbed), and `parseTaskSearch`.

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
