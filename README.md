# UniVoyage - Developer Guide

This README is focused on helping a new developer clone the project, run it locally, and start contributing quickly.

For product/business overview, see:
- `docs/project-overview.md`

For full CI/CD and pipeline diagrams, see:
- `docs/ci-cd-pipelines.md`

---

## Repository Structure

- `frontend/` - React + TypeScript + Vite application
- `backend/` - Java 23 + Spring Boot API
- `.github/workflows/` - CI/CD workflows
- `docs/` - technical and project documentation
- `.githooks/` - shared git hooks
- `scripts/` - local setup scripts

---

## Prerequisites

- Node.js 22+ and npm
- Java 23
- Docker Desktop (recommended for local PostgreSQL)

Optional:
- Maven installed globally (not required if using `./mvnw`)

---

## 1) Clone the project

```bash
git clone https://github.com/misterdrac/UniVoyage
cd UniVoyage
```

---

## 2) Setup git hooks (recommended)

Run once per clone:

```bash
./scripts/setup-git-hooks.sh
```

Windows note:
- Run the command in Git Bash or WSL.
- If you use PowerShell only, configure hooks path manually:

```powershell
git config core.hooksPath .githooks
```

Pre-commit hook currently:
- formats backend via Maven formatter
- formats frontend via Prettier
- re-stages formatted files automatically

---

## 3) Frontend local setup (first)

```bash
cd frontend
npm ci
```

Create `.env` in `frontend/` (or copy from `env.example`):

```env
VITE_API_URL=http://localhost:8080/api
```

Start frontend:

```bash
npm run dev
```

Default local URL:
- `http://localhost:5173`

---

## 4) Backend local setup (second)

Open a second terminal:

```bash
cd backend
```

Create `.env` from backend example and fill required values:

```bash
cd backend
cp env.example .env
```

PowerShell alternative:

```powershell
cd backend
Copy-Item env.example .env
```

- `DB_PASSWORD`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- API keys you use (`OPENWEATHER_API_KEY`, `GEOAPIFY_API_KEY`, `GEMINI_API_KEY`, `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`)

### Recommended: run backend with Docker Compose

```bash
docker compose up --build -d
```

If Windows blocks 5432 binding, host DB port may be `5433` (as already documented in backend notes).

Stop services:

```bash
docker compose down
```

### Alternative: run directly with Maven wrapper

```bash
./mvnw spring-boot:run
```

Backend local URL:
- `http://localhost:8080`

Health endpoint:
- `http://localhost:8080/actuator/health`

---

## 5) How frontend connects to backend

- Frontend API base is configured to `/api` in `frontend/src/config/apiConfig.ts`
- Backend CORS is configured in `backend/src/main/java/com/univoyage/config/CorsFilterConfig.java`
- Local allowed origins default to:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

---

## 6) Quick sanity check (after startup)

After starting both services, verify:

- Frontend opens at `http://localhost:5173`
- Backend health returns UP at `http://localhost:8080/actuator/health`
- Frontend can call backend API (no CORS errors in browser console)

If backend health fails:
- confirm Docker/PostgreSQL is running
- confirm backend `.env` exists in `backend/.env`
- confirm DB credentials in `.env` match your local database/container

---

## 7) Useful local commands

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd backend
./mvnw clean test
./mvnw formatter:format
./mvnw formatter:validate
```

---

## 8) CI/CD quick notes

- default branch: `master`
- commit pipelines run on feature branches
- stricter checks run on PR pipelines
- release/deploy flow runs from `master-pipeline.yml` (manual release inputs + deploy chain)

Deployment targets:
- backend: Railway
- frontend: Vercel

Required deployment secrets are documented in:
- `docs/ci-cd-pipelines.md`

