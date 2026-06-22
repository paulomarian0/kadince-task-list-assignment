# Task Management Application

A full-stack task management app built with **Ruby on Rails**, **GraphQL**, **React + TypeScript**, and **PostgreSQL**. The API is GraphQL-only (no REST endpoints).

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Rails 8.1 (API-only) |
| API | GraphQL (`graphql-ruby`) |
| Database | PostgreSQL 16 |
| Frontend | React 19, TypeScript, Vite, Apollo Client |
| E2E Tests | Cypress |
| Backend Tests | Minitest |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Make](https://www.gnu.org/software/make/) (optional but recommended; on Windows use `docker compose` commands directly — see below)
- Node.js 20+ (only if running the frontend outside Docker)

## Quick Start

Start the full stack (PostgreSQL, API, and frontend):

```bash
make up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL API | http://localhost:3000/graphql |
| Health check | http://localhost:3000/up |

Seed sample data (optional):

```bash
docker compose exec api bin/rails db:seed
```

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make up` | Build and start all services in the background |
| `make down` | Stop and remove containers |
| `make migrate` | Run database migrations |
| `make test` / `make test-api` | Run backend Minitest suite |
| `make test-e2e` | Run Cypress end-to-end tests (stack must be running) |
| `make restart` | Restart the API container |
| `make logs` | Follow API logs |
| `make shell` | Open a bash shell in the API container |

On Windows without Make, use `docker compose up -d --build`, `docker compose exec api bin/rails db:migrate`, etc.

## Docker Architecture

```text
docker-compose.yml
├── db       → PostgreSQL 16 (port 5432)
├── api      → Rails + GraphQL (port 3000)
└── client   → Vite dev server (port 5173)
```

The API container automatically:

1. Waits for PostgreSQL to be ready
2. Runs `bundle install` if needed
3. Runs `db:prepare` (create/migrate)
4. Starts the Rails server

No manual `docker exec` is required for normal development.

## Environment Variables

Copy [`.env.example`](.env.example) for local reference:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://postgres:postgres@db:5432/api_development` | PostgreSQL connection (set in compose) |
| `VITE_GRAPHQL_URL` | `/graphql` | GraphQL endpoint used by the frontend |
| `VITE_API_PROXY_TARGET` | `http://api:3000` | Vite dev proxy target (Docker) |

## GraphQL API

### Query

```graphql
query {
  tasks(status: "pending") {
    id
    title
    description
    completed
    createdAt
    updatedAt
  }
}
```

`status` accepts: `all`, `pending`, `completed` (or omit for all).

### Mutations

```graphql
mutation {
  createTask(input: { title: "Example", description: "Example" }) {
    task { id title completed }
    errors
  }
}
```

Available mutations: `createTask`, `updateTask`, `completeTask`, `reopenTask`, `deleteTask`.

## Running Tests

### Backend (Minitest)

```bash
make test-api
```

Tests cover GraphQL queries and all mutations.

### Frontend (Cypress)

Ensure the stack is running, then:

```bash
make test-e2e
```

Or interactively:

```bash
cd client && npm run test:e2e:open
```

## Project Structure

```text
.
├── api/                  # Rails GraphQL backend
│   ├── app/graphql/      # Schema, types, mutations
│   ├── app/models/       # ActiveRecord models
│   └── test/graphql/     # GraphQL integration tests
├── client/               # React frontend
│   ├── src/components/   # UI components
│   ├── src/graphql/      # Queries and mutations
│   └── cypress/e2e/      # End-to-end tests
├── docker-compose.yml
├── Dockerfile
└── Makefile
```

## Local Development (without Docker)

### Backend

1. Start PostgreSQL locally
2. Set `DATABASE_URL=postgres://postgres:postgres@localhost:5432/api_development`
3. From `api/`:

```bash
bundle install
bin/rails db:prepare
bin/rails server
```

### Frontend

From `client/`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

The Vite dev server proxies `/graphql` to `http://localhost:3000`.

## Architecture Notes

- **GraphQL-only API** — all client communication goes through `/graphql`
- **Rails-native design** — GraphQL layer → ActiveRecord → PostgreSQL (no repository/use-case layers)
- **No Redis** — Rails 8 uses in-memory cache and async jobs in development; PostgreSQL handles persistence
