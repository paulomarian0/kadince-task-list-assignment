.PHONY: up dev down migrate test test-api test-e2e restart restart-all logs logs-client logs-all shell build seed setup

# Foreground dev: API + client logs stream in this terminal (hot reload enabled)
dev:
	docker compose up --build db api client

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

migrate:
	docker compose exec api bin/rails db:migrate

seed:
	docker compose exec api bin/rails db:seed

setup: up
	@sleep 15
	$(MAKE) migrate
	$(MAKE) seed

test: test-api

test-api:
	docker compose exec -e RAILS_ENV=test -e DATABASE_URL=postgres://postgres:postgres@db:5432/api_test api bin/rails db:test:prepare test

test-e2e:
	cd client && npm run test:e2e

restart:
	docker compose restart api

restart-all:
	docker compose restart

logs:
	docker compose logs -f api

logs-client:
	docker compose logs -f client

logs-all:
	docker compose logs -f api client

shell:
	docker compose exec api bash
