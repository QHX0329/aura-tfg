---
phase: 01-core-backend
plan: "03"
subsystem: api
tags: [postgis, django, drf, geospatial, stores, favorites]

# Dependency graph
requires:
  - phase: 01-core-backend/01-01
    provides: User model with max_search_radius_km, BargainAPIException, success_response
provides:
  - StoreChain model (name, slug, logo_url)
  - Store model with PostGIS PointField srid=4326, GiST spatial index
  - UserFavoriteStore M2M through-table
  - GET /api/v1/stores/?lat=&lng= geospatial radius search ordered by distance
  - GET /api/v1/stores/{id}/ detail with is_favorite per user
  - POST /api/v1/stores/{id}/favorite/ toggle endpoint
affects:
  - 01-core-backend/01-04 (prices need Store FK)
  - 01-core-backend/01-05 (shopping lists may reference stores)
  - 01-core-backend/01-06 (optimizer uses store locations)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PostGIS distance_lte filter with Distance annotation and D(km=) measure
    - Point(lng, lat, srid=4326) constructor order (longitude first)
    - GistIndex on PointField for spatial performance
    - favorite action bypasses get_queryset() to avoid requiring lat/lng

key-files:
  created:
    - backend/apps/stores/models.py
    - backend/apps/stores/admin.py
    - backend/apps/stores/migrations/0001_initial.py
    - backend/apps/stores/serializers.py
    - backend/apps/stores/views.py
    - backend/apps/stores/urls.py
    - backend/tests/unit/test_stores.py
    - backend/tests/integration/test_store_endpoints.py
  modified: []

key-decisions:
  - "favorite action uses Store.objects.get(pk=pk) directly instead of get_object() to avoid requiring lat/lng query params"
  - "retrieve endpoint also requires lat/lng (same get_queryset) — documented in tests"
  - "SRID 4326 throughout; Point(lng, lat) constructor order enforced via must_haves"

patterns-established:
  - "PostGIS pattern: Point(lng, lat, srid=4326); filter(location__distance_lte=(point, D(km=r))).annotate(distance=Distance(...))"
  - "Missing required query params → BargainAPIException(code='MISSING_LOCATION', status=400)"
  - "SerializerMethodField distance_km: reads annotated .distance.m / 1000, rounds to 2 decimals"

requirements-completed: [STORE-01, STORE-02, STORE-03, STORE-04]

# Metrics
duration: 52min
completed: 2026-03-16
---

# Phase 1 Plan 03: Stores Domain Summary

**PostGIS-backed stores API with geospatial radius search, distance ordering, chain/local differentiation, and user favorites toggle**

## Performance

- **Duration:** 52 min
- **Started:** 2026-03-16T20:08:05Z
- **Completed:** 2026-03-16T21:00:24Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- StoreChain, Store (PostGIS PointField + GiST index), and UserFavoriteStore models with migration
- Geospatial radius search returning stores ordered by distance_km; 400 on missing lat/lng
- Favorite toggle action (POST /favorite/) that requires auth and works bidirectionally without needing lat/lng
- 21 tests (6 unit + 15 integration) all passing

## Task Commits

1. **Task 1: StoreChain, Store, UserFavoriteStore models + migration** - `902c54d` (feat)
2. **Task 2: Store serializers, views, URLs + integration tests** - `c5db490` (feat)

## Files Created/Modified

- `backend/apps/stores/models.py` - StoreChain, Store (PostGIS), UserFavoriteStore models
- `backend/apps/stores/admin.py` - Admin registration with list_display/filters
- `backend/apps/stores/migrations/0001_initial.py` - All tables + GiST spatial index
- `backend/apps/stores/serializers.py` - StoreChainSerializer, StoreListSerializer, StoreDetailSerializer
- `backend/apps/stores/views.py` - StoreViewSet with geospatial queryset + favorite action
- `backend/apps/stores/urls.py` - DefaultRouter registering StoreViewSet
- `backend/tests/unit/test_stores.py` - Serializer tests (is_local_business, chain, distance_km)
- `backend/tests/integration/test_store_endpoints.py` - Endpoint tests (radius, ordering, favorites, auth)

## Decisions Made

- **Favorite action bypasses get_queryset():** `favorite` uses `Store.objects.get(pk=pk)` directly because the geospatial queryset requires lat/lng which is not relevant when simply toggling a favorite. This avoids making clients pass lat/lng to a non-geospatial operation.
- **retrieve also requires lat/lng:** Since `retrieve` calls `get_queryset()`, it also requires lat/lng. This is intentional — the distance annotation is needed for `distance_km` in the detail serializer. Tests document this explicitly.
- **Distance annotation in serializer:** `get_distance_km` reads the annotated `distance` attribute (a Django `Distance` object); `.m` gives metres which are divided by 1000 and rounded.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test assertions for endpoints requiring lat/lng**
- **Found during:** Task 2 test execution
- **Issue:** Integration tests `test_store_detail_includes_chain_and_hours` and `test_is_favorite_false_when_not_favorited` called detail endpoint without lat/lng, expecting 200 but receiving 400
- **Fix:** Added `?lat=...&lng=...&radius_km=10` params to detail test calls
- **Files modified:** backend/tests/integration/test_store_endpoints.py
- **Verification:** All 21 tests pass after fix
- **Committed in:** c5db490 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed favorite action 400 due to get_object() calling get_queryset()**
- **Found during:** Task 2 test execution (TestFavorites::test_toggle_favorite_adds_favorite)
- **Issue:** `self.get_object()` in `favorite` action calls `get_queryset()` which requires lat/lng, causing 400 for POST /favorite/ without location params
- **Fix:** Replaced `self.get_object()` with direct `Store.objects.get(pk=pk)` lookup in favorite action
- **Files modified:** backend/apps/stores/views.py
- **Verification:** All 21 tests pass, 401 still returned for unauthenticated
- **Committed in:** c5db490 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for correct API behavior. No scope creep.

## Issues Encountered

None beyond the two auto-fixed bugs above.

## Next Phase Readiness

- Store tables and geospatial API fully operational — Plan 01-04 (prices) can reference Store FK
- PostGIS pattern established: `Point(lng, lat)` and `distance_lte + Distance` annotation ready to reuse
- No blockers for plan 01-04

## Self-Check: PASSED

All files exist on disk and both task commits verified in git history.

---
*Phase: 01-core-backend*
*Completed: 2026-03-16*
