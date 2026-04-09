<!-- generated-by: gsd-doc-writer -->
# Testing Guide

## Frameworks and Setup
Backend:
- `pytest` + `pytest-django` (see `backend/pytest.ini`)
- CI backend installs Python 3.12, PostGIS service, Redis service

Frontend:
- `jest` with `jest-expo` preset (see `frontend/package.json` `jest` section)
- React Native Testing Library in `frontend/devDependencies`

## Running Tests
Full project:
```bash
make test
```

Backend only (Docker-first flow):
```bash
make test-backend
make test-backend-cov
```

Frontend only:
```bash
make test-frontend
# or
cd frontend && npm run test -- --coverage --ci
```

Targeted frontend run:
```bash
cd frontend && npm run test
```

## Writing New Tests
Backend conventions:
- Unit/integration/e2e split under `tests/unit`, `tests/integration`, `tests/e2e`
- Add tests close to affected behavior and keep fixtures deterministic

Frontend conventions:
- Existing tests in `frontend/__tests__/`
- Favor component-level tests with React Native Testing Library

## Coverage Requirements
| Area | Threshold |
|---|---|
| Backend CI | `--cov-fail-under=80` in `.github/workflows/ci-backend.yml` |
| Frontend CI | Coverage uploaded, no explicit fail threshold configured |

## CI Integration
Backend CI (`.github/workflows/ci-backend.yml`):
- Triggers on push/PR to `main`/`develop` when `backend/**` changes
- Lint job with Ruff, then test job with PostGIS + Redis services
- Test command: `pytest --cov=apps --cov-report=xml --cov-fail-under=80 -v`

Frontend CI (`.github/workflows/ci-frontend.yml`):
- Triggers on push/PR to `main`/`develop` when `frontend/**` changes
- Runs lint, typecheck, and Jest coverage
- Test command: `npm run test -- --coverage --ci`