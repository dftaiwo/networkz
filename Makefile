SHELL := /bin/bash

.PHONY: dev prod down logs migrate seed test backend-shell mysql-shell build clean

dev:
	docker compose up --build

dev-d:
	docker compose up -d --build

prod:
	docker compose -f compose.yml -f compose.prod.yml up --build -d

prod-config:
	docker compose -f compose.yml -f compose.prod.yml config

down:
	docker compose down

down-v:
	docker compose down -v

logs:
	docker compose logs -f --tail=200

migrate:
	docker compose exec backend alembic upgrade head

makemigration:
	docker compose exec backend alembic revision --autogenerate -m "$(m)"

seed:
	docker compose exec backend python -m app.seed

test:
	docker compose exec backend pytest -q

backend-shell:
	docker compose exec backend bash

mysql-shell:
	docker compose exec mysql mysql -unetworkz -pnetworkz networkz

clean:
	docker compose down -v --remove-orphans
