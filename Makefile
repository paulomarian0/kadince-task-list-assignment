.PHONY: up down migrate test test-api test-e2e restart logs shell build

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

migrate:
	docker compose exec api bin/rails db:migrate

test: test-api

test-api:
	docker compose exec -e RAILS_ENV=test -e DATABASE_URL=postgres://postgres:postgres@db:5432/api_test api bin/rails db:test:prepare test

test-e2e:
	cd client && npm run test:e2e

restart:
	docker compose restart api

logs:
	docker compose logs -f api

shell:
	docker compose exec api bash
