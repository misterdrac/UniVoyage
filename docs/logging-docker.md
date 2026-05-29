# Docker logging (local / staging-style stacks)

This document describes where logs go when you run the backend stack with `backend/docker-compose.yml`, how rotation works, and how to tune verbosity without duplicating configuration.

## Principles

- **Spring Boot** controls logger **levels** (`logging.level.*` in YAML and equivalent env vars). Logback-specific keys are **not** used; the backend ships **Log4j2** (`spring-boot-starter-log4j2`).
- **Log4j2** (`backend/src/main/resources/log4j2.xml`) controls **appenders**: console vs rolling file, patterns, and rollover policy (size + time).
- **PostgreSQL** controls its own server logs via `postgresql.conf`-style `-c` flags in Compose. JDBC/SQL from the app is **not** echoed by Hibernate here; use Postgres settings if you need slow-query or statement logging.

## Where logs are stored

| Layer | On the host (repo-relative) | Inside container | Notes |
|--------|------------------------------|------------------|--------|
| Backend file logs | `backend/logs/backend/` | `/app/logs/` | Rolling files `univoyage.log` + `univoyage-YYYY-MM-dd-i.log.gz` |
| PostgreSQL collector logs | `backend/logs/postgres/` | `/var/log/postgresql/` | Collector writes under `log_directory`; filenames rotate daily (`postgresql-YYYYMMDD.log`) |
| Docker daemon (`json-file`) | Managed by Docker Desktop / Engine | N/A | Stdout/stderr from each container; size-limited by Compose `logging` |

The `backend/logs/` tree is **gitignored**. Create it automatically by starting Compose or create empty dirs if needed.

## Quick inspection

```bash
cd backend

# Backend rolling log (current file)
tail -f logs/backend/univoyage.log

# Postgres server log (daily filenames — pick today's file or use glob)
tail -f logs/postgres/postgresql-$(date +%Y%m%d).log
# Windows PowerShell: adjust date or use `Get-ChildItem logs/postgres | Sort-Object LastWriteTime | Select-Object -Last 1`

# Container stdout/stderr (Docker copy of process streams)
docker compose logs -f backend
docker compose logs -f postgres
```

## Environment variables

Set these in `backend/.env` (see `backend/env.example`). Compose passes suitable defaults into the backend container.

### Backend (Spring Boot + file appenders)

| Variable | Purpose | Typical local | Quieter “staging-like” |
|----------|---------|---------------|-------------------------|
| `LOG_DIR` | Absolute directory for Log4j2 rolling files | `/app/logs` (set by Compose) | Same |
| `LOG_FILE_MAX_SIZE` | Max size before rollover | `10 MB` | `25 MB` |
| `LOG_ROLLING_MAX_FILES` | Archived file slots (Log4j2 `DefaultRolloverStrategy`) | `14` | `30` |
| `LOGGING_LEVEL_ROOT` | Root logger | `INFO` | `WARN` |
| `LOGGING_LEVEL_COM_UNIVOYAGE` | Application package | `DEBUG` | `INFO` |

Spring maps `LOGGING_LEVEL_*` env vars to `logging.level.*`; dots become underscores after the prefix.

### PostgreSQL (server)

| Variable | Postgres flag | Default in Compose |
|----------|----------------|-------------------|
| `POSTGRES_LOG_MIN_MESSAGES` | `log_min_messages` | `info` |
| `POSTGRES_LOG_STATEMENT` | `log_statement` | `none` |

Use `POSTGRES_LOG_STATEMENT=all` or `ddl` only briefly when debugging (noisy, impacts disk).

## Rotation and retention

### Backend (Log4j2)

- **Triggers:** daily (`TimeBasedTriggeringPolicy`) and **size** (`LOG_FILE_MAX_SIZE`, default `10 MB`).
- **Retention:** controlled by `DefaultRolloverStrategy max` (`LOG_ROLLING_MAX_FILES`, default `14`).
- **Console:** INFO and above only (`ThresholdFilter`); finer grain stays in files for `com.univoyage` when level allows.

### PostgreSQL

- `log_rotation_age=1d`, `log_rotation_size=50MB`, `log_truncate_on_rotation=on` (see `docker-compose.yml`).
- Files land under `logs/postgres/` via bind mount.

### Docker `json-file` driver

Compose sets `max-size` and `max-file` per service so container stdout/stderr cannot grow without bound on the daemon volume.

## Verification checklist

1. **Startup:** `docker compose up --build -d` — confirm `logs/backend/univoyage.log` appears and that `logs/postgres/` receives today’s `postgresql-YYYYMMDD.log` after traffic or checkpoints.
2. **Rotation:** generate volume (e.g. scripted requests + temporarily lower `LOG_FILE_MAX_SIZE` or Postgres `log_rotation_size`) and confirm new gz/files appear.
3. **Errors:** trigger a controlled failure (e.g. bad auth request); stack traces should include `%wEx` formatting in file logs.
4. **No duplicate frameworks:** confirm Hibernate SQL is not flooding Spring logs (`application-docker.yml` / defaults keep SQL at WARN).

## Related files

- `backend/docker-compose.yml` — mounts, `logging:` driver, Postgres flags, `LOG_DIR` for backend
- `backend/src/main/resources/log4j2.xml` — appenders and rollover
- `backend/src/main/resources/application-docker.yml` — Spring logging levels only (no Logback blocks)
