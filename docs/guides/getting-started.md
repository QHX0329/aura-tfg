<!-- generated-by: gsd-doc-writer -->
# Getting Started

## Prerequisites
- Docker + Docker Compose
- Node.js >= 24.10.0 (root workspace) and npm
- Python is bundled in backend Docker image for normal dev flow

Optional (Windows host-only GIS tooling):
- OSGEO4W for local GDAL/GEOS host execution

## Installation Steps
1. Clone and enter the repository:
```bash
git clone https://github.com/QHX0329/bargain-tfg.git
cd bargain-tfg
```
2. Create environment file:
```bash
cp .env.example .env
```
3. Install frontend dependencies:
```bash
make frontend-install
```
4. Start backend stack:
```bash
make dev
```
5. Run migrations and optional seed data:
```bash
make migrate
make seed
```

## First Run
1. Backend (Docker):
```bash
make dev
```
2. Frontend (Expo):
```bash
make frontend
```
3. Open API health endpoint:
```bash
# Expected: JSON health payload
http://localhost:8000/api/v1/health/
```

## Common Setup Issues
1. `.env` missing or incomplete:
- Symptom: Django starts with config/auth/database errors.
- Fix: recreate `.env` from `.env.example` and fill required values.

2. Frontend cannot connect to backend:
- Symptom: network errors in Expo app.
- Fix: verify backend is up on `http://localhost:8000` and CORS allows your origin.

3. GIS libraries mismatch on host:
- Symptom: GDAL/GEOS import failures when running host Python.
- Fix: prefer Docker backend commands (`make test-backend`, `make lint-backend`).

## Next Steps
- Development workflow: `docs/guides/development.md`
- Testing workflow: `docs/testing/testing.md`
- Architecture reference: `docs/architecture/overview.md`
- Configuration reference: `docs/configuration/configuration.md`