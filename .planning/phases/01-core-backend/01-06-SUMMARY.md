---
phase: 01-core-backend
plan: "06"
subsystem: api
tags: [django, drf, drf-spectacular, openapi, swagger, pytest, coverage, integration-testing]

# Dependency graph
requires:
  - phase: 01-core-backend/01-01
    provides: users app — JWT auth, registration, profile endpoints
  - phase: 01-core-backend/01-02
    provides: products app — catalog, categories, autocomplete, proposals
  - phase: 01-core-backend/01-03
    provides: stores app — PostGIS store model, favorite action
  - phase: 01-core-backend/01-04
    provides: prices app — Price, PriceAlert, compare/history/crowdsource endpoints
  - phase: 01-core-backend/01-05
    provides: shopping_lists app — ShoppingList CRUD, items, collaborators, templates
provides:
  - All 5 Phase 1 app URL namespaces wired under /api/v1/
  - OpenAPI schema at /api/v1/schema/ (SpectacularAPIView)
  - Swagger UI at /api/v1/schema/swagger-ui/ (SpectacularSwaggerView)
  - ReDoc at /api/v1/schema/redoc/ (SpectacularRedocView)
  - Cross-domain integration test covering full happy-path
  - Phase 1 gate: 179 tests passing, 92% coverage (>= 80% required)
affects:
  - 02-business-notifications
  - all future phases consuming Phase 1 API contracts

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Schema endpoints mounted at /api/v1/schema/ (versioned, not /api/schema/)"
    - "SpectacularRedocView alongside Swagger UI for dual documentation access"
    - "Cross-domain E2E tests in tests/integration/test_cross_domain.py"

key-files:
  created:
    - backend/tests/integration/test_cross_domain.py
  modified:
    - backend/config/urls.py

key-decisions:
  - "Schema endpoints moved from /api/schema/ to /api/v1/schema/ — versioned path consistent with all other API endpoints"
  - "Added SpectacularRedocView at /api/v1/schema/redoc/ — provides alternative documentation format alongside Swagger UI"
  - "Cross-domain test uses direct API client without mocking — validates real URL resolution and serializer contracts"
  - "Phase 1 coverage gate met at 92% (79 lines missed of 1415 total) across all 5 implemented apps"

patterns-established:
  - "Phase gate pattern: run full pytest --cov-fail-under=80 before marking phase complete"
  - "Cross-domain test: register → login → authenticate → interact with each domain in sequence"

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
  - AUTH-05
  - PROD-01
  - PROD-02
  - PROD-03
  - PROD-04
  - PROD-05
  - STORE-01
  - STORE-02
  - STORE-03
  - STORE-04
  - PRICE-01
  - PRICE-02
  - PRICE-03
  - PRICE-04
  - PRICE-05
  - LIST-01
  - LIST-02
  - LIST-03
  - LIST-04

# Metrics
duration: 15min
completed: 2026-03-16
---

# Phase 1 Plan 06: Phase Gate — URL Wiring, Swagger, and Cross-Domain Integration Tests Summary

**All 5 Phase 1 app namespaces wired at /api/v1/, OpenAPI schema + Swagger UI + ReDoc exposed at /api/v1/schema/, 179 tests passing at 92% coverage confirming full Phase 1 backend gate**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-16T21:30:00Z
- **Completed:** 2026-03-16T21:45:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Updated `config/urls.py` to mount schema endpoints at `/api/v1/schema/` (consistent versioned path), added `SpectacularRedocView`
- Wrote `tests/integration/test_cross_domain.py` with 4 tests: full register→login→categories→create-list→detail happy path, and all three schema endpoints
- Full pytest suite: 179 passed, 0 failures, 92% coverage — Phase 1 gate confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire all URL namespaces, add Swagger endpoints, and verify full routing** - `89515be` (feat)
2. **Task 2: Cross-domain integration test and full coverage run** - `3c9a936` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `backend/config/urls.py` — Schema endpoints moved to /api/v1/schema/, SpectacularRedocView added, comments clarify five core vs. future skeleton domains
- `backend/tests/integration/test_cross_domain.py` — 4 E2E tests: happy path + three schema URL accessibility tests

## Decisions Made

- Schema endpoints moved from `/api/schema/` (legacy path) to `/api/v1/schema/` — consistent with all other v1 endpoints and required by Phase 1 gate spec
- Added `SpectacularRedocView` at `/api/v1/schema/redoc/` alongside Swagger UI — plan required both, original urls.py only had Swagger
- Cross-domain test uses `api_client` fixture (DRF APIClient) and real JWT tokens rather than `force_authenticate` to validate the full auth flow end-to-end

## Deviations from Plan

None — plan executed exactly as written. The schema URL path (`/api/v1/schema/` vs `/api/schema/`) was a minor fix (Rule 1 correction) but it was already the intended target from the plan spec, not a deviation.

## Issues Encountered

None. All 175 pre-existing tests continued to pass after URL changes. The 4 new cross-domain tests passed immediately on first run (GREEN from first attempt due to correct URL config).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Phase 1 (Core Backend) is complete. All 5 app URL namespaces are wired, OpenAPI documentation is accessible, and the cross-domain integration test confirms the full auth → products → lists happy path works end-to-end.

**Phase 2 (Business & Notifications) can begin.** Prerequisites satisfied:
- JWT auth: register, login, refresh, password-reset all working
- Products: CRUD, categories, autocomplete, proposals
- Stores: PostGIS-backed store listing with favorite action
- Prices: compare, history, crowdsource, alerts
- Shopping Lists: CRUD, items, collaborators, templates
- API documentation: Swagger UI + ReDoc accessible

**No blockers for Phase 2.**

## Self-Check: PASSED

- FOUND: backend/config/urls.py
- FOUND: backend/tests/integration/test_cross_domain.py
- FOUND: .planning/phases/01-core-backend/01-06-SUMMARY.md
- FOUND: commit 89515be (Task 1)
- FOUND: commit 3c9a936 (Task 2)

---
*Phase: 01-core-backend*
*Completed: 2026-03-16*
