<!-- generated-by: gsd-doc-writer -->
# Deployment

## Deployment Targets
Detected deployment options from repository config:
- Render staging/prod infrastructure via `render.yaml`
- Docker image/runtime deployment via `backend/Dockerfile`
- Docker Compose runtime via `docker-compose.yml` and `docker-compose.dev.yml`
- GitHub Pages deployment for web landing via `.github/workflows/deploy-web-gh-pages.yml`
- iOS unsigned IPA CI artifact pipeline via `.github/workflows/ios-build.yml`

## Build and Release Pipeline
Render/API runtime path:
1. Build Docker image from `backend/Dockerfile`.
2. Run migrations and collect static in `dockerCommand`.
3. Start Gunicorn web service (`bargain-api`).
4. Run worker services (`bargain-celery-worker`, `bargain-celery-beat`).

GitHub Pages path:
1. Workflow checkout on `main` changes under `frontend/web/**`.
2. Node 24 setup + dependency install.
3. Build step runs inside `frontend/web` according to `.github/workflows/deploy-web-gh-pages.yml`.
4. Upload pages artifact and deploy with `actions/deploy-pages@v4`.

## Environment Setup
Production/staging requires dashboard-managed env vars:
- Django and infra: `SECRET_KEY`, `ALLOWED_HOSTS`, `DATABASE_URL`, `REDIS_URL`
- External services: `ORS_API_KEY`, `GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACES_API_KEY`,
  `GEMINI_API_KEY`, `GOOGLE_CLOUD_VISION_API_KEY`
- Security/monitoring: `CORS_ALLOWED_ORIGINS`, `SENTRY_DSN`

See `docs/configuration/configuration.md` for variable-level details.

## Rollback Procedure
Render rollback (recommended):
1. Open Render service deployment history.
2. Select last known healthy deployment.
3. Trigger rollback/redeploy from dashboard.
4. Validate API health endpoint before restoring traffic.

GitHub Pages rollback:
1. Re-run deploy workflow for previous good commit.
2. Or revert offending commit in `frontend/web` and push to `main`.

<!-- VERIFY: Exact Render rollback button labels can vary by Render UI version. -->

## Monitoring
Current repository-visible monitoring integration:
- Sentry environment variables (`SENTRY_*`) declared in `.env.example`
- Render health check path configured to `/api/v1/health/`

<!-- VERIFY: Sentry project dashboard URL and alert routing are configured outside this repository. -->
<!-- VERIFY: Production uptime/SLA monitoring destinations are managed in Render dashboard settings. -->