<!-- generated-by: gsd-doc-writer -->
# Development Guide

## Local Setup
1. Clone and configure `.env` from `.env.example`.
2. Install frontend dependencies:
```bash
make frontend-install
```
3. Start backend services in Docker:
```bash
make dev
```
4. Apply migrations and optional seed:
```bash
make migrate
make seed
```
5. Start frontend (Expo):
```bash
make frontend
```

## Build and Development Commands
| Command | Description |
|---|---|
| `make dev` | Start backend services with `docker-compose.dev.yml` |
| `make stop` | Stop development services |
| `make build` | Build production images |
| `make build-dev` | Build development images |
| `make frontend` | Run Expo app |
| `make frontend-web` | Run `frontend/web` Vite app |
| `make logs` | Tail all development logs |
| `make logs-backend` | Tail backend logs |

Root `package.json` scripts:
| Command | Description |
|---|---|
| `npm run docs:images` | Export doc images |
| `npm run docs:images:setup` | Install tools and Playwright Chromium |
| `npm run docs:images:all` | Setup + export images |

Frontend scripts (`frontend/package.json`):
| Command | Description |
|---|---|
| `npm run start` | Expo start |
| `npm run android` | Expo Android target |
| `npm run ios` | Expo iOS target |
| `npm run web` | Expo web target |
| `npm run lint` | ESLint run |
| `npm run format` | Prettier check |
| `npm run format:fix` | Prettier write |
| `npm run typecheck` | TypeScript no-emit validation |

## Code Style
- Backend lint/format: Ruff (`backend/ruff.toml`) via `make lint-backend`.
- Frontend lint: ESLint (`frontend/eslint.config.mjs`) via `cd frontend && npm run lint`.
- Frontend format: Prettier via `cd frontend && npm run format`.

## Branch Conventions
Project conventions from repository docs:
- `main` for production-ready state
- `develop` for integration
- `feature/*`, `fix/*`, `docs/*` for scoped work

## Pull Request Process
Use `.github/pull_request_template.md` checklist:
1. Classify change type (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
2. Link issue (`Closes #XX`) when applicable.
3. Confirm project conventions and no hardcoded secrets.
4. Ensure tests pass (`make test`) and lint passes (`make lint`).
5. Update docs/memory when behavior changes.
6. Add screenshots if UI changes are included.