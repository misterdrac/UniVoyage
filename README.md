# UniVoyage — Developer guide

Clone the repo, configure environment files, run frontend and backend in two terminals, and use the shared formatters before you commit.

**Also useful**

- Product overview: [`docs/project-overview.md`](docs/project-overview.md)
- CI/CD, deploy targets, GitHub secrets: [`docs/ci-cd-pipelines.md`](docs/ci-cd-pipelines.md)
- Docker log paths and rotation: [`docs/logging-docker.md`](docs/logging-docker.md)
- Backend API keys and OAuth details: [`backend/README.md`](backend/README.md)

---

## Repository layout

| Path | Role |
|------|------|
| `frontend/` | React + TypeScript + Vite |
| `backend/` | Java 23 + Spring Boot (Docker Compose for local API) |
| `scripts/terminal/` | Frontend dev splash (`print.mjs`, `ascii-art.txt`) |
| `backend/scripts/` | `start.ps1` / `start.sh` Docker helpers |
| `.githooks/` | Pre-commit formatting |
| `scripts/setup-git-hooks.sh` | One-time hook install |
| `docs/` | Architecture, CI/CD, logging |
| `.github/workflows/` | GitHub Actions |

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| npm | bundled with Node |
| Java | 23+ |
| Docker Desktop | recommended (Postgres + backend container) |
| Git | clone and hooks |

Maven globally is optional — use `backend/mvnw` (or `mvnw.cmd` on Windows).

---

## Quick start (two terminals)

**Terminal 1 — backend** (Spring Boot in Docker; custom banner on startup):

```bash
cd backend
npm ci          # only if you use backend/package.json scripts
npm run dev
```

**Terminal 2 — frontend** (terminal splash, then Vite):

```bash
cd frontend
npm ci
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Health | http://localhost:8080/actuator/health |

Stop backend stack: `cd backend && npm run stop` or `docker compose down`.

---

## One-time setup

### Clone

```bash
git clone https://github.com/misterdrac/UniVoyage
cd UniVoyage
```

### Git hooks (format on commit)

**Git Bash / WSL:**

```bash
./scripts/setup-git-hooks.sh
```

**PowerShell:**

```powershell
git config core.hooksPath .githooks
```

The pre-commit hook runs the **backend Maven formatter** and **frontend Prettier**, then re-stages only files already in the index (`git diff --cached --name-only`). Stage only what belongs in that commit.

### Backend environment

```bash
cd backend
cp env.example .env
```

PowerShell: `Copy-Item env.example .env`

**Minimum for local Docker:**

```env
DB_PASSWORD=your_db_password
POSTGRES_PASSWORD=your_db_password
JWT_SECRET=your-long-random-secret
```

Generate a strong JWT secret: `openssl rand -base64 32`

See [`backend/env.example`](backend/env.example) for OAuth, email (Resend/Postmark), trip APIs, cookies, and `POSTGRES_HOST_PORT` (often **5433** on Windows if 5432 is taken).

**OAuth (browser testing)** — set client ID/secret in `backend/.env` and register the same redirect in each provider console:

```text
http://localhost:5173/auth/google/callback
http://localhost:5173/auth/github/callback
http://localhost:5173/auth/linkedin/callback
```

OAuth and AI keys live in **`backend/.env`**, not in Vite env vars.

**Email OTP / password reset / verify** — configure `EMAIL_PROVIDER`, `RESEND_API_KEY` (or another provider from `env.example`), plus `APP_FRONTEND_RESET_URL` and `APP_FRONTEND_VERIFY_URL` pointing at localhost routes.

### Frontend environment (optional)

```bash
cd frontend
npm ci
```

For most daily dev, **`npm run dev` without `.env` is enough** — Vite proxies `/api` to `http://127.0.0.1:8080`.

Optional explicit API base (copy from [`frontend/env.example`](frontend/env.example)):

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Running the backend

Local API runs in **Docker** (`univoyage_backend`), not as a bare `java -jar` on the host.

### npm scripts (`backend/package.json`)

| Command | What it does |
|---------|----------------|
| `npm run dev` | `docker compose up --build` — follow logs; **Spring banner** on container start |
| `npm start` | Detached up, then `logs -f backend` |
| `npm run start:detached` | `docker compose up --build -d` only |
| `npm run logs` | Tail backend logs (banner only after restart/rebuild) |
| `npm run stop` | `docker compose down` |
| `npm run ps` | `docker compose ps` |

Shell wrappers (same stack, no npm):

```powershell
cd backend
.\scripts\start.ps1 -Detached
```

```bash
cd backend
./scripts/start.sh -d
```

Plain Compose:

```bash
cd backend
docker compose up --build -d
docker compose ps
```

After changing `banner.txt`, **rebuild**: `npm run dev` or `docker compose up --build`.

### Spring Boot banner (Docker, prod, IDE, Maven)

Custom startup art replaces the default Spring logo:

- **File:** [`backend/src/main/resources/banner.txt`](backend/src/main/resources/banner.txt)
- **Enabled in:** `application.yml`, `application-docker.yml` (`SPRING_PROFILES_ACTIVE=docker`), `application-prod.yml` (`prod`)
- Prints UniVoyage ASCII, then API version, Spring Boot, Java, and active profile

Keep frontend terminal art in sync: [`scripts/terminal/ascii-art.txt`](scripts/terminal/ascii-art.txt) (lines starting with `#` are comments and skipped by the frontend splash).

### Without Docker (Postgres already running)

Point `backend/.env` at your Postgres host/port, then:

```bash
cd backend
npm run run:local
```

Windows: `npm run run:local:win` or `.\mvnw.cmd spring-boot:run`

Same `banner.txt` appears in the IDE Run console if you start `UniVoyageApplication` from your editor.

---

## Running the frontend

```bash
cd frontend
npm run dev
```

Runs [`scripts/terminal/print.mjs`](scripts/terminal/print.mjs) (`frontend` profile — cyan panel with URLs and proxy hint), then Vite.

- App: http://localhost:5173
- API calls use `/api` → Vite dev proxy → backend `:8080`

Edit ASCII in `scripts/terminal/ascii-art.txt`; edit backend startup art in `banner.txt`.

---

## How frontend talks to backend

- API base path: `/api` (see `frontend/src/config/apiConfig.ts`)
- CORS: `backend/src/main/java/com/univoyage/config/CorsFilterConfig.java`
- Local origins typically include `http://localhost:5173` and `http://127.0.0.1:5173`

OAuth uses a **full-page redirect** (no popup); callback routes live under `/auth/{provider}/callback`.

---

## Formatting and lint

### Automatic (pre-commit)

After hooks are installed, every commit runs:

1. **Backend:** `./mvnw formatter:format` in `backend/`
2. **Frontend:** `npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,scss,md,json}"` in `frontend/`

### Manual

**Backend**

```bash
cd backend
./mvnw formatter:format
./mvnw formatter:validate
```

Windows: `.\mvnw.cmd` instead of `./mvnw`.

**Frontend**

```bash
cd frontend
npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,scss,md,json}"
npm run lint
```

---

## Sanity check

| Check | Expected |
|-------|----------|
| Frontend home | http://localhost:5173 loads |
| Backend health | http://localhost:8080/actuator/health → `"status":"UP"` |
| Network tab | `/api/...` without CORS errors |
| Login | http://localhost:5173/?login=1 |

If health fails: `docker compose ps` in `backend/`, verify `.env` passwords match Postgres, and port `POSTGRES_HOST_PORT` (5433 vs 5432).

---

## Tests and build

**Frontend** (`cd frontend`):

```bash
npm run test:run          # all Vitest tests
npm run test:auth-matrix  # OAuth / reset / verify / OTP matrix
npm run test:e2e          # OAuth callback E2E smoke
npm run build             # production build (run before push)
```

**Backend:**

```bash
cd backend
./mvnw clean test
./mvnw -q test "-Dtest=AuthIdentitiesControllerIntegrationTest"
```

Auth QA checklist: [`frontend/docs/AUTH_REGRESSION_CHECKLIST.md`](frontend/docs/AUTH_REGRESSION_CHECKLIST.md)

---

## Useful URLs (local)

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend |
| http://localhost:5173/?login=1 | Open sign-in |
| http://localhost:5173/profile | Profile / sign-in methods |
| http://localhost:5173/admin | Admin login + 2FA |
| http://localhost:5173/auth/reset-password | Password reset |
| http://localhost:5173/auth/verify-email | Email verification |
| http://localhost:8080/actuator/health | Backend health |

---

## Common issues

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED 127.0.0.1:8080` | Backend not up — `cd backend && docker compose ps`; container must be **Up** |
| Backend **Restarting**, Flyway checksum mismatch | Stale DB vs migrations — dev reset: `docker compose down -v && docker compose up --build` |
| OAuth `redirect_uri_mismatch` | Provider console URI must match `http://localhost:5173/auth/{provider}/callback` exactly |
| OTP / reset email missing | Set `EMAIL_*` in `backend/.env`; check `docker compose logs backend` |
| Postgres connection refused | Start Compose; check `POSTGRES_HOST_PORT` in `.env` |
| Pre-commit fails on deleted file | `git add -u` for removals; hook only re-stages cached paths |
| Vitest `user-event` missing | `cd frontend && npm ci` |

---

## CI/CD (short)

- Default branch: `master`
- Feature-branch pushes run fast feedback workflows; PRs add stricter checks
- Full master pipeline and release/deploy: [`docs/ci-cd-pipelines.md`](docs/ci-cd-pipelines.md)
- Deploy: backend **Railway** (`SPRING_PROFILES_ACTIVE=prod`), frontend **Vercel**

---

## Command cheat sheet

```bash
# Frontend
cd frontend && npm run dev && npm run build && npm run lint && npm run test:run

# Backend (Docker)
cd backend && npm run dev && npm run logs && npm run stop

# Backend (format / test)
cd backend && ./mvnw formatter:format && ./mvnw clean test
```
