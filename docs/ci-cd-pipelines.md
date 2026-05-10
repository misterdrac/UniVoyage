# CI/CD Pipelines Overview

This document describes the current GitHub Actions setup and execution order.

## Unified Pipeline Flow (Mermaid)

```mermaid
flowchart TB
  DEV[Developer push] --> COMMIT_EVENT[Push event on feature branch]
  COMMIT_EVENT --> PR[Open or update PR to master]

  subgraph COMMIT_STAGE["Commit Pipelines (fast feedback)"]
    direction TB
    subgraph FEC["Frontend Commit"]
      direction TB
      FEC1[build_frontend_quick] --> FEC2[frontend_sbom_generation]
    end
    subgraph BEC["Backend Commit"]
      direction TB
      BEC1[build_java_project] --> BEC2[run_backend_tests] --> BEC3[sbom_generation]
    end
  end

  COMMIT_EVENT --> FEC1
  COMMIT_EVENT --> BEC1

  subgraph PR_STAGE["PR Pipelines (merge gate)"]
    direction TB
    subgraph FEPR["Frontend PR"]
      direction TB
      FEPR0[dependency_review_pr]
      FEPR1[install_dependencies] --> FEPR6[build_frontend]
      FEPR6 --> FEPR2[lint_frontend informational]
      FEPR6 --> FEPR3[format_frontend]
      FEPR6 --> FEPR4[npm_audit_frontend]
      FEPR6 --> FEPR5[trivy_frontend_fs_scan]
      FEPR3 --> FEPR8[frontend_sbom_generation_pr]
      FEPR3 --> FEPR7[build_frontend_artifact]
      FEPR4 --> FEPR7
      FEPR5 --> FEPR7
      FEPR7 --> FEPR9[trivy_frontend_dist_scan]
      FEPR8 --> FEPR9
    end

    subgraph BEPR["Backend PR"]
      direction TB
      BEPR0[dependency_review_pr]
      BEPR1[validate_backend] --> BEPR2[build_backend] --> BEPR3[docker_and_security_scans_pr]
      BEPR3 --> BEPR4[test_backend]
      BEPR4 --> BEPR5[code_format_validate]
      BEPR5 --> BEPR6[sbom_generation_pr]
      BEPR3 --> BEPR7[trivy_backend_codebase_scan_pr]
      BEPR6 --> BEPR7
    end
  end

  PR --> FEPR0
  PR --> FEPR1
  PR --> BEPR0
  PR --> BEPR1
  FEPR9 --> MERGE[All required PR checks green]
  BEPR7 --> MERGE
  MERGE --> MASTER_PUSH[Merge to master]

  subgraph MASTER["Master Pipeline"]
    direction TB
    subgraph MASTER_BE["Backend CI lane — no frontend depends-on"]
      direction TB
      M1[build_java_project] --> M2[build_backend_docker] --> M3[run_backend_tests]
      M3 --> M4[code_format_validate]
      M4 --> M5[sbom_generation]
      M2 --> M6[trivy_backend_scans]
      M5 --> M6
    end

    subgraph MASTER_FE["Frontend CI lane — parallel, independent DAG"]
      direction TB
      MF1[frontend_build] --> MF2[frontend_security_scan]
    end

    subgraph MASTER_MANUAL["Manual owner-only release and deploy"]
      direction TB
      MM1[codebase_security_scan]
      MM2[create_tag]
      MM3[create_release]
      MM4[deploy_backend_railway]
      MM5[deploy_frontend_vercel]
      MM1 --> MM2 --> MM3 --> MM4 --> MM5
    end
  end

  MASTER_PUSH --> M1
  MASTER_PUSH --> MF1
  M6 --> MM1
  MF2 --> MM1
```

## Workflow Summary

### Frontend Commit Pipeline
- File: `.github/workflows/frontend-ci.yml`
- Trigger: `push` (non-master branches), `workflow_dispatch`
- Jobs:
  1. `build_frontend_quick`
  2. `frontend_sbom_generation`

### Frontend PR Pipeline
- File: `.github/workflows/frontend-pr-ci.yml`
- Trigger: `pull_request` to `master`, `workflow_dispatch`
- Jobs (DAG order; aligns with master: build then security/format tail):
  1. `dependency_review_pr` (parallel)
  2. `install_dependencies`
  3. `build_frontend`
  4. `lint_frontend` (informational), `format_frontend`, `npm_audit_frontend`, `trivy_frontend_fs_scan` (after build)
  5. `frontend_sbom_generation_pr` (after format)
  6. `build_frontend_artifact` (after format, npm audit, Trivy fs)
  7. `trivy_frontend_dist_scan`

### Backend Commit Pipeline
- File: `.github/workflows/backend-ci.yml`
- Trigger: `push` (non-master branches), `workflow_dispatch`
- Jobs:
  1. `build_java_project`
  2. `run_backend_tests`
  3. `sbom_generation`

### Backend PR Pipeline
- File: `.github/workflows/backend-pr-ci.yml`
- Trigger: `pull_request` to `master`, `workflow_dispatch`
- Jobs (same sequencing idea as master backend):
  1. `dependency_review_pr` (parallel)
  2. `validate_backend`
  3. `build_backend`
  4. `docker_and_security_scans_pr`
  5. `test_backend`
  6. `code_format_validate`
  7. `sbom_generation_pr`
  8. `trivy_backend_codebase_scan_pr`

### Master Pipeline
- File: `.github/workflows/master-pipeline.yml`
- Trigger: `push` to `master`, `workflow_dispatch`
- Automatic CI is **two parallel DAGs** with **no cross-edges** until manual release steps:
  - **Backend lane:** `build_java_project` → `build_backend_docker` → `run_backend_tests` → `code_format_validate` → `sbom_generation` → `trivy_backend_scans`. Backend SBOM (`sbom_generation`) depends only on backend jobs (not on `frontend_build`).
  - **Frontend lane:** `frontend_build` → `frontend_security_scan`.
- Manual owner-only jobs:
  1. `codebase_security_scan` (`workflow_dispatch` only) — **`needs: [trivy_backend_scans, frontend_security_scan]`** (last backend Trivy job + last frontend security job)
  2. `create_tag`
  3. `create_release`
  4. `deploy_backend_railway`
  5. `deploy_frontend_vercel`

### Required GitHub Secrets

The current workflows use the following repository secrets (all in `master-pipeline.yml`):

- `RAILWAY_TOKEN` - Railway API token used by backend deploy job
- `RAILWAY_PROJECT_ID` - Railway project identifier
- `RAILWAY_SERVICE` - Railway backend service name/id used by `railway up`
- `BACKEND_HEALTHCHECK_URL` - public backend health endpoint used post-deploy
- `VERCEL_TOKEN` - Vercel token used by frontend deploy job
- `VERCEL_ORG_ID` - Vercel organization/team ID
- `VERCEL_PROJECT_ID` - Vercel project ID

Notes:
- Store these as Repository Secrets in GitHub (`Settings -> Secrets and variables -> Actions`).
- Deploy jobs are manual/owner-only and depend on these secrets being present.

### Nightly Dependency Check
- File: `.github/workflows/nightly-dependency-check.yml`
- Trigger: scheduled cron + `workflow_dispatch`
- Jobs:
  1. `backend_dependency_updates`
  2. `frontend_dependency_updates`
