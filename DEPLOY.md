# Deployment

NetworkZ ships as a docker-compose stack and deploys via a GitHub Action that SSHes into your server and runs `git pull && docker compose up -d --build`. Two workflows:

- `.github/workflows/ci.yml` — runs backend pytest + frontend build + compose validation on every push and PR.
- `.github/workflows/deploy.yml` — runs on push to `main` (or manually via "Run workflow"), SSHes to the production server, rebuilds the stack, runs migrations, and verifies health.

---

## What you need

### 1 · A server

Anything that can run Docker. Cheapest reasonable setups:

- DigitalOcean / Hetzner / Linode VPS (2 GB RAM minimum, 2 vCPU recommended)
- Ubuntu 22.04 LTS or Debian 12
- Public IP
- Port 80 + 443 open in the firewall
- A non-root sudo user (recommended) — e.g. `deploy`

Server prep (one-time, run as root or with `sudo`):

```bash
# Install Docker & Compose plugin
curl -fsSL https://get.docker.com | sh

# Create a deploy user and put them in the docker group
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy

# Clone the repo to a known path
sudo -u deploy git clone https://github.com/dftaiwo/networkz.git /home/deploy/networkz

# Create the production .env (NOT committed to git)
sudo -u deploy cp /home/deploy/networkz/.env.example /home/deploy/networkz/.env
sudo -u deploy nano /home/deploy/networkz/.env
```

Edit `.env` with **production** values:

```ini
APP_ENV=prod
DATABASE_URL=mysql+pymysql://networkz:<strong-password>@mysql:3306/networkz
JWT_SECRET=<32+ random bytes>
FRONTEND_URL=https://networkz.yourdomain.com
BACKEND_CORS_ORIGINS=https://networkz.yourdomain.com

SMTP_HOST=smtp.mailgun.org          # or sendgrid, postmark, etc.
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASSWORD=<provider-password>
SMTP_FROM=NetworkZ <no-reply@networkz.yourdomain.com>
SMTP_TLS=true

ADMIN_EMAILS=you@yourdomain.com

MYSQL_USER=networkz
MYSQL_PASSWORD=<same-strong-password-as-above>
MYSQL_ROOT_PASSWORD=<another-strong-password>
MYSQL_DATABASE=networkz
```

### 2 · DNS

Point an A record at the server's public IP:

```
networkz.yourdomain.com   A   <server-ip>
```

Then edit `caddy/Caddyfile` — replace `:80 {` with:

```
networkz.yourdomain.com {
    ...
}
```

Caddy will obtain & renew Let's Encrypt certs automatically on first boot.

### 3 · An SSH key for the GitHub Action

On your **local machine** (not the server, not GitHub):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/networkz_deploy -C "github-actions-deploy" -N ""
```

Add the **public key** to the server:

```bash
ssh-copy-id -i ~/.ssh/networkz_deploy.pub deploy@<server-ip>
```

Test that GitHub can SSH in:

```bash
ssh -i ~/.ssh/networkz_deploy deploy@<server-ip> "docker --version"
```

You'll paste the **private key** (`~/.ssh/networkz_deploy`, the file without `.pub`) into GitHub in the next step.

### 4 · GitHub secrets

In the repo settings → **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret name      | Value |
|------------------|-------|
| `DEPLOY_HOST`    | Server IP or domain (e.g. `203.0.113.10` or `networkz.yourdomain.com`) |
| `DEPLOY_USER`    | SSH username (e.g. `deploy`) |
| `DEPLOY_SSH_KEY` | Full contents of `~/.ssh/networkz_deploy` (private key, including the `-----BEGIN ...` lines) |
| `DEPLOY_PORT`    | SSH port — only if not 22 (optional) |
| `DEPLOY_PATH`    | Absolute path to the repo on the server (e.g. `/home/deploy/networkz`) |

Optionally also a repo **variable** (Variables tab, not Secrets):

| Variable name | Value |
|---------------|-------|
| `PUBLIC_URL`  | `https://networkz.yourdomain.com` — surfaced in the deploy log |

### 5 · First-time boot on the server

Before the first auto-deploy, manually bring the stack up once so MySQL initialises:

```bash
ssh deploy@<server-ip>
cd ~/networkz
docker compose -f compose.yml -f compose.prod.yml up -d --build
docker compose -f compose.yml -f compose.prod.yml exec backend alembic upgrade head
```

Visit `https://networkz.yourdomain.com` — you should land on the NetworkZ landing page.

---

## Day-to-day flow

1. Push to `main` (or merge a PR).
2. CI runs: backend pytest, frontend build, compose validation. Red CI blocks deploy *manually* — the deploy workflow doesn't gate on CI by default; if you want it to, see "Gating deploy on CI" below.
3. Deploy workflow SSHes in, pulls code, rebuilds containers, runs migrations, health-checks.
4. Site is live on the new revision.

To deploy manually (e.g. roll back by pushing a revert):

- Actions tab → **Deploy** → Run workflow → choose branch.

### Rolling back

```bash
# on the server
cd ~/networkz
git log --oneline -10           # find the last good commit
git checkout <sha>
docker compose -f compose.yml -f compose.prod.yml up -d --build
```

Or revert in git on `main` and let the action redeploy automatically.

### Gating deploy on CI (optional)

If you want CI to be a gate, add this to the top of `deploy.yml`'s `deploy` job:

```yaml
needs: [backend, frontend, compose]
```

…and change the trigger so deploy is in the same workflow as CI (or use `workflow_run`).

---

## Security notes

- The deploy SSH key should be **dedicated** to the GitHub Action — don't reuse your personal key.
- The server's `.env` contains real secrets (DB password, SMTP password, JWT secret). Keep it out of git; back it up separately.
- Consider enabling [GitHub environments](https://docs.github.com/en/actions/deployment/targeting-different-environments) protection on the `production` environment so deploys require manual approval.
- Rate limit SSH (`fail2ban` or `ufw`) on the server.

## What it doesn't do (yet)

- No automated DB backups — see `TODO.md` ("Backups + restore drill").
- No blue/green deploy — the stack does briefly restart during deploy. Acceptable for v1; revisit if traffic warrants.
- No container registry — images build on the server. Faster deploys would come from pushing to GHCR.
