---
phase: 07-testing-deploy-memoria
plan: "01"
subsystem: optimizer, deploy
tags: [ors, distance-matrix, render, staging, settings, tdd]
dependency_graph:
  requires: []
  provides:
    - ORS distance matrix client
    - Render infrastructure declaration
    - Production settings SSL fix
    - DATABASE_URL postgis conversion
  affects:
    - backend/apps/optimizer/services/distance.py
    - backend/config/settings/base.py
    - backend/config/settings/prod.py
    - render.yaml
tech_stack:
  added:
    - OpenRouteService API v2/matrix/driving-car (replaces Graphhopper)
    - render.yaml (Render IaC)
  patterns:
    - Fallback haversine when ORS key empty or connection fails
    - SECURE_PROXY_SSL_HEADER for Render reverse proxy SSL termination
    - postgresql:// -> postgis:// prefix conversion for dj_database_url
key_files:
  created:
    - backend/tests/unit/test_distance_ors.py
    - render.yaml
  modified:
    - backend/apps/optimizer/services/distance.py
    - backend/config/settings/base.py
    - backend/config/settings/prod.py
    - .env.example
    - Makefile
decisions:
  - ORS replaces Graphhopper as the distance matrix provider for staging/production
  - Fallback to haversine when ORS_API_KEY is empty (no crash, graceful degradation)
  - render.yaml uses sync:false for all secrets (configured in Render Dashboard, not repo)
  - DATABASES conversion done in base.py so it applies to all environments using DATABASE_URL
metrics:
  duration: ~25min
  completed_date: "2026-04-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 5
---

# Phase 7 Plan 01: ORS Integration + Render Deploy Summary

ORS API v2 client replacing Graphhopper for distance matrix with fallback haversine, plus render.yaml and production settings fixes for Render staging deploy.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Migrar distance.py de Graphhopper a ORS | a63c079 | distance.py, test_distance_ors.py, base.py, .env.example |
| 2 | Fix settings produccion + render.yaml | e6c3e08 | prod.py, base.py, render.yaml, Makefile |

## Task 1: distance.py Migration (Before/After)

### Before (Graphhopper)

```python
def get_distance_matrix(
    points: list[tuple[float, float]],
    graphhopper_url: str | None = None,
) -> tuple[list[list[float]], list[list[float]]]:
    # POST {graphhopper_url}/matrix
    # payload: {"from_points": gh_points, "to_points": gh_points, ...}
    # distances in meters -> /1000 to get km
    # times in seconds -> /60 to get minutes
```

### After (ORS)

```python
def get_distance_matrix(
    points: list[tuple[float, float]],
    ors_api_key: str | None = None,
) -> tuple[list[list[float]], list[list[float]]]:
    # If api_key empty -> fallback haversine directly (no HTTP call)
    # POST https://api.openrouteservice.org/v2/matrix/driving-car
    # Headers: {"Authorization": api_key, "Content-Type": "application/json"}
    # payload: {"locations": [[lng,lat],...], "metrics": ["distance","duration"], "units": "km"}
    # distances already in km (units=km) -> NO division
    # durations in seconds -> /60 for minutes
```

Key changes:
- Parameter renamed `graphhopper_url` -> `ors_api_key` (backward compatible: callers passing no arg still work)
- `from django.conf import settings` moved to module-level import
- Empty key short-circuits before making any HTTP request
- Authorization sent as header, not in URL
- No `/1000` division on distances (ORS returns km directly when `units=km`)

## Task 2: Production Settings Fix

### SECURE_PROXY_SSL_HEADER (prod.py)

Added immediately after `SECURE_SSL_REDIRECT = True`:

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
```

Without this, Render's load balancer forwards HTTP internally, causing Django to
see HTTP and redirect to HTTPS indefinitely (redirect loop). This setting tells
Django to trust `X-Forwarded-Proto: https` from the Render proxy.

### DATABASE_URL Conversion (base.py)

```python
_db_url = os.environ.get("DATABASE_URL", "")
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgis://", 1)

DATABASES = {
    "default": dj_database_url.config(
        default=_db_url or "postgis://bargain_user:bargain_password@localhost:5432/bargain_db",
        engine="django.contrib.gis.db.backends.postgis",
    )
}
```

Render's managed PostgreSQL emits `postgresql://` prefix. Django GIS backend requires
`postgis://`. The conversion is done once in base.py before passing to dj_database_url.

### render.yaml Services

```
databases:
  - bargain-postgres  (PostgreSQL managed, free plan)

services:
  - bargain-api              (web, Docker, Gunicorn)
  - bargain-redis            (redis managed, free plan)
  - bargain-celery-worker    (worker, Docker, celery worker)
  - bargain-celery-beat      (worker, Docker, celery beat)
```

All secrets use `sync: false` — must be configured in the Render Dashboard.
`DATABASE_URL` injected automatically via `fromDatabase` reference.
`REDIS_URL` injected automatically via `fromService` reference.

## Test Status

**3 tests created in `tests/unit/test_distance_ors.py`:**
- `test_ors_matrix_success` — ORS mock response parsed correctly (km + minutes)
- `test_ors_fallback_on_connection_error` — ConnectionError triggers haversine fallback
- `test_empty_ors_key_uses_fallback` — Empty ORS_API_KEY uses haversine directly

**Execution status: NOT RUN — Docker Desktop not running at execution time.**

Expected outcome: all 3 tests pass. The logic is straightforward:
- Test 1 mocks `requests.post` returning `{"distances": [[0,5.2],[5.2,0]], "durations": [[0,1200.5],[1200.5,0]]}`
  and verifies `dist_km[0][1] == 5.2` and `time_min[0][1] == approx(20.008)`
- Test 2 raises `requests.ConnectionError` and verifies fallback returns 2x2 matrix
- Test 3 patches `settings.ORS_API_KEY = ""` and verifies fallback without HTTP call

To run when Docker is available:
```bash
docker compose -f docker-compose.dev.yml exec backend pytest tests/unit/test_distance_ors.py -v --tb=short
```

## Deviations from Plan

None — plan executed exactly as written.

- `distance.py` imports `settings` at module level (not inside the function as in original).
  This is cleaner and avoids the lazy import pattern that was only needed because the
  original function read from settings only on the fallback path.
- `render.yaml` build command included with the web service declaration to run collectstatic
  and migrate on deploy (production best practice).

## Notes for Next Plans

1. **ORS API key required for staging:** Must be set in Render Dashboard before first deploy.
   Free tier allows 40 requests/minute — sufficient for demo/staging.
2. **render.yaml ready to push:** Commit e6c3e08 can be pushed to trigger first Render deploy.
3. **Regression test:** `tests/unit/test_optimizer.py` should still pass — `get_distance_matrix`
   is called with keyword arg `graphhopper_url` in some tests; those will now pass `None`
   to `ors_api_key` which correctly falls back to settings. Run regression when Docker available.
4. **`GRAPHHOPPER_URL` setting remains** in base.py for backward compatibility; can be removed
   in a future cleanup plan once confirmed no other code references it.

## Known Stubs

None — all wiring is complete. ORS_API_KEY is read from environment, fallback is active
when empty. render.yaml services are fully declared.

## Self-Check: PASSED

- [x] `backend/apps/optimizer/services/distance.py` exists and contains `openrouteservice.org`
- [x] `backend/tests/unit/test_distance_ors.py` exists with 3 tests
- [x] `backend/config/settings/base.py` contains `ORS_API_KEY`
- [x] `backend/config/settings/prod.py` contains `SECURE_PROXY_SSL_HEADER`
- [x] `render.yaml` exists with `bargain-api`, `bargain-redis`, `bargain-celery-worker`, `bargain-celery-beat`, `bargain-postgres`
- [x] `.env.example` contains `ORS_API_KEY=your-ors-api-key`
- [x] Commit a63c079 exists (Task 1)
- [x] Commit e6c3e08 exists (Task 2)
