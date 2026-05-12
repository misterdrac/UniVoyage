# UniVoyage — Developer guide

This README helps you clone the repo, run frontend and backend locally, and contribute.

- Product and feature overview: [`docs/project-overview.md`](docs/project-overview.md)
- CI/CD workflows, Mermaid flow, and deployment secrets: [`docs/ci-cd-pipelines.md`](docs/ci-cd-pipelines.md)

Docker stack logging (paths, rotation, env knobs):
- `docs/logging-docker.md`

---

## Repository layout

- `frontend/` — React + TypeScript + Vite
- `backend/` — Java 23 + Spring Boot
- `.github/workflows/` — GitHub Actions
- `docs/` — documentation
- `.githooks/` — shared Git hooks
- `scripts/` — local setup helpers

---

## Prerequisites

- Node.js 22+ and npm
- Java 23
- Docker Desktop (recommended for local PostgreSQL via Compose)

Optional: Maven installed globally (not required if you use `./mvnw`).

---

## 1) Clone

```bash
git clone https://github.com/misterdrac/UniVoyage
cd UniVoyage
```

---

## 2) Git hooks (recommended)

Run once per clone:

```bash
./scripts/setup-git-hooks.sh
```

**Windows:** run that in **Git Bash** or **WSL**. If you only use PowerShell, point Git at the hooks directory:

```powershell
git config core.hooksPath .githooks
```

The pre-commit hook formats backend (Maven formatter) and frontend (Prettier) and re-stages changed files.

---

## 3) Frontend (run first)

```bash
cd frontend
npm ci
```

Create `frontend/.env` (see `frontend/env.example`):

```env
VITE_API_URL=http://localhost:8080/api
```

Start dev server:

```bash
npm run dev
```

Default URL: `http://localhost:5173`

---

## 4) Backend (second terminal)

```bash
cd backend
```

Create `backend/.env` from the example:

```bash
cp env.example .env
```

PowerShell:

```powershell
Copy-Item env.example .env
```

Fill at least: `DB_PASSWORD`, `POSTGRES_PASSWORD`, `JWT_SECRET`, and any API keys you need (`OPENWEATHER_API_KEY`, `GEOAPIFY_API_KEY`, `GEMINI_API_KEY`, `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`).

### Recommended: Docker Compose

From `backend/`:

```bash
docker compose up --build -d
```

If Windows blocks port `5432`, the mapped host port may be `5433` (see backend Compose/docs).

Stop:

```bash
docker compose down
```

### Alternative: Maven only

```bash
./mvnw spring-boot:run
```

Backend: `http://localhost:8080`  
Health: `http://localhost:8080/actuator/health`

---

## 5) How frontend talks to backend

- API base path is configured under `/api` (see `frontend/src/config/apiConfig.ts`).
- CORS is configured server-side (see `backend/src/main/java/com/univoyage/config/CorsFilterConfig.java`).
- Local origins typically allowed include `http://localhost:5173` and `http://127.0.0.1:5173`.

---

## 6) Quick sanity check after startup

- Frontend loads at `http://localhost:5173`.
- Backend health is UP at `http://localhost:8080/actuator/health`.
- Browser console shows no CORS errors when calling the API.

If health fails: confirm Compose/Postgres is up, `backend/.env` exists, and DB credentials match the container.

---

## 7) Useful commands

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

## 8) CI/CD (short)

- Default branch: `master`
- Push pipelines on feature branches give fast feedback
- PR pipelines add stricter checks before merge
- Full master workflow plus manual release/deploy: see [`docs/ci-cd-pipelines.md`](docs/ci-cd-pipelines.md)

Deploy targets: backend **Railway**, frontend **Vercel**. Required GitHub secrets are listed in that doc.
