# NetworkZ

> A community-built alumni directory for startups that went through the
> **Google for Startups Accelerator** program.

NetworkZ is independent and not affiliated with Google. It lets alumni put up a
profile (startup, country, cohort year, industry, logo, optional contact info)
and lets anyone browse the directory — though **contact info is only revealed
to signed-in members**.

- **Stack:** React + Vite + TailwindCSS · FastAPI + SQLAlchemy + Alembic ·
  MySQL 8 · MailHog (dev) / SMTP (prod) · Caddy reverse proxy
- **Auth:** email signup → magic-link sign-in → optional password
- **Deploy:** Docker Compose. Dev stack is one `docker compose up` away.

---

## Quick start

```bash
git clone <this-repo> networkz && cd networkz
cp .env.example .env       # tweak ADMIN_EMAILS at minimum
docker compose up --build  # or `make dev`
```

When the stack is up:

| What                 | URL                              |
|----------------------|----------------------------------|
| Frontend (Vite)      | http://localhost:5173            |
| Backend (FastAPI)    | http://localhost:8000            |
| API docs (Swagger)   | http://localhost:8000/docs       |
| MailHog inbox (dev)  | http://localhost:8025            |

If a port is taken on your host, override via env:

```bash
MYSQL_PUBLISH_PORT=3308 MAILHOG_PUBLISH_PORT=8027 \
BACKEND_PUBLISH_PORT=8002 FRONTEND_PUBLISH_PORT=5175 \
docker compose up
```

## What gets seeded

- Any email in `ADMIN_EMAILS` (comma-separated) automatically gets `is_admin=1`
  on first signup, with access to `/admin`.
- Industries and country codes are constants in code
  (`backend/app/constants.py`) — adjust there to change the dropdowns.

## Architecture

```
                    ┌────────────────┐
                    │   React SPA    │  Vite + Tailwind + react-router
                    └──────┬─────────┘
                           │
                  /api  ───┼──── /uploads
                           ▼
                    ┌────────────────┐
                    │   FastAPI      │  routers: auth, profiles, uploads,
                    │   (Python 3.12)│           stats, admin, reference
                    └──────┬─────────┘
                           │
                           ▼
                    ┌────────────────┐         ┌─────────────────┐
                    │   MySQL 8      │         │ uploads volume  │
                    │   utf8mb4      │         │ (logos, WebP)   │
                    └────────────────┘         └─────────────────┘
```

In **prod**, Caddy serves the built SPA, proxies `/api` to the backend, serves
`/uploads` directly with long cache headers, and terminates TLS via ACME.

## Auth flow

1. `POST /api/auth/signup {email}` — creates a user, emails a magic link.
2. User clicks link → SPA calls `POST /api/auth/magic-link/consume {token}`
   → backend marks email verified and returns a 7-day JWT.
3. SPA stores the JWT in `localStorage` (`networkz_jwt`).
4. Optional `POST /api/auth/password {password}` — set a password for faster
   future sign-ins via `POST /api/auth/login`.

Sign-in via magic link uses `POST /api/auth/magic-link/request`; the response
is always 204 to avoid leaking whether the account exists.

## Visibility gate

`GET /api/profiles` returns the same shape to everyone, but `contact_email`
and `contact_phone` are `null` for anonymous callers and populated for
authenticated ones. The same is true for `/api/profiles/{id}`.

## Tests

Backend pytest suite covers magic-link create/consume/expiry, password set/login,
profile CRUD, country/industry validation, search filters, the visibility gate,
and admin gating.

```bash
# inside docker
docker compose exec backend pytest -q

# or locally
cd backend && python3.12 -m venv .venv && .venv/bin/pip install -e ".[dev]"
.venv/bin/pytest -q
```

## Makefile shortcuts

```
make dev            # docker compose up --build
make dev-d          # detached
make prod           # apply compose.prod.yml
make prod-config    # validate prod overlay parses
make test           # run pytest inside the backend container
make migrate        # alembic upgrade head
make makemigration m="describe change"
make logs           # tail logs
make down           # stop containers
make clean          # down + remove volumes
```

## Production deploy

1. Point a DNS A record at your host, edit `caddy/Caddyfile`: replace `:80`
   with your domain (e.g. `networkz.example.com {`) and add your ACME email
   in the global block.
2. In `.env`, set:
   - `FRONTEND_URL=https://networkz.example.com`
   - `JWT_SECRET=` long random string
   - `SMTP_HOST=`, `SMTP_USER=`, `SMTP_PASSWORD=`, `SMTP_FROM=`, `SMTP_TLS=true`
3. `docker compose -f compose.yml -f compose.prod.yml up -d --build`

Caddy will obtain certs on first boot and proxy `/api/*` to the backend.

## Project layout

```
gfsaa/
├── backend/
│   ├── app/                # FastAPI app
│   │   ├── main.py
│   │   ├── config.py       # pydantic-settings
│   │   ├── db.py / models.py / schemas.py
│   │   ├── security.py     # JWT, bcrypt, magic-link tokens
│   │   ├── email.py        # fastapi-mail
│   │   ├── constants.py    # industries, countries, cohort years
│   │   ├── routers/        # auth, profiles, uploads, stats, admin, reference
│   │   ├── email_templates/ # welcome.html, signin.html
│   │   └── seed.py
│   ├── alembic/            # migrations
│   ├── tests/              # pytest suite
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api/client.ts
│   │   ├── auth/AuthContext.tsx
│   │   ├── components/     # NavBar, ProfileCard, FilterBar, LogoUploader …
│   │   └── pages/          # Landing, Directory, ProfileDetail, SignUp,
│   │                       # SignIn, MagicLinkLand, MyProfile, Admin
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── Dockerfile          # multi-stage: dev | builder | prod (caddy)
├── caddy/Caddyfile
├── compose.yml
├── compose.prod.yml
├── Makefile
└── .env.example
```

## License

MIT (or your preferred license — add it here).
