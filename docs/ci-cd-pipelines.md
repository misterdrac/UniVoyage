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
      FEPR1[install_dependencies]
      FEPR2[lint_frontend informational]
      FEPR3[format_frontend]
      FEPR4[npm_audit_frontend]
      FEPR5[trivy_frontend_fs_scan]
      FEPR6[build_frontend]
      FEPR7[build_frontend_artifact]
      FEPR8[frontend_sbom_generation_pr]
      FEPR9[trivy_frontend_dist_scan]
      FEPR1 --> FEPR2
      FEPR1 --> FEPR3
      FEPR1 --> FEPR4
      FEPR1 --> FEPR5
      FEPR3 --> FEPR6
      FEPR4 --> FEPR6
      FEPR5 --> FEPR6
      FEPR6 --> FEPR7
      FEPR6 --> FEPR8
      FEPR7 --> FEPR9
      FEPR8 --> FEPR9
    end

    subgraph BEPR["Backend PR"]
      direction TB
      BEPR0[dependency_review_pr]
      BEPR1[code_format_validate] --> BEPR2[validate_backend] --> BEPR3[build_backend] --> BEPR4[test_backend]
      BEPR3 --> BEPR5[sbom_generation_pr]
      BEPR4 --> BEPR6[docker_and_security_scans_pr]
      BEPR5 --> BEPR7[trivy_backend_codebase_scan_pr]
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
    subgraph MASTER_CI["Automatic CI on master"]
      direction TB
      M1[code_format_validate] --> M2[build_java_project] --> M3[run_backend_tests] --> M4[build_backend_docker]
      M2 --> M5[sbom_generation]
      M4 --> M6[trivy_backend_scans]
      M5 --> M6
      MF1[frontend_build] --> MF2[frontend_security_scan]
      M6 --> CI_DONE[Master CI green]
      MF2 --> CI_DONE
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
  CI_DONE --> MM1
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
- Jobs:
  1. `dependency_review_pr`
  2. `install_dependencies`
  3. `lint_frontend` (informational)
  4. `format_frontend`
  5. `npm_audit_frontend`
  6. `trivy_frontend_fs_scan`
  7. `build_frontend`
  8. `build_frontend_artifact`
  9. `frontend_sbom_generation_pr`
  10. `trivy_frontend_dist_scan`

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
- Jobs:
  1. `dependency_review_pr`
  2. `code_format_validate`
  3. `validate_backend`
  4. `build_backend`
  5. `test_backend`
  6. `sbom_generation_pr`
  7. `docker_and_security_scans_pr`
  8. `trivy_backend_codebase_scan_pr`

### Master Pipeline
- File: `.github/workflows/master-pipeline.yml`
- Trigger: `push` to `master`, `workflow_dispatch`
- Automatic CI jobs:
  1. `code_format_validate`
  2. `build_java_project`
  3. `run_backend_tests`
  4. `build_backend_docker`
  5. `sbom_generation`
  6. `trivy_backend_scans`
  7. `frontend_build`
  8. `frontend_security_scan`
- Manual owner-only jobs:
  1. `codebase_security_scan`
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
