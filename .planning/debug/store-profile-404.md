---
status: awaiting_human_verify
trigger: "GET /api/v1/stores/3/ returns 404 NOT_FOUND even though the store exists"
created: 2026-03-18T00:00:00Z
updated: 2026-03-18T00:00:00Z
---

## Current Focus

hypothesis: get_queryset() always applies geo filtering (lat/lng/radius_km required), so when retrieve() calls get_object() it uses this filtered queryset — if lat/lng are provided but the store is outside the radius (or there's a geo mismatch), or if lat/lng are missing, the store is excluded and DRF raises 404
test: read views.py — CONFIRMED
expecting: fix by overriding retrieve() or get_queryset() to skip geo filtering for detail lookups
next_action: await human verification that store profile screen loads correctly end-to-end

## Symptoms

expected: GET /api/v1/stores/3/?lat=37.613972&lng=-5.668853&radius_km=20 should return the store with id=3 (or ideally GET /api/v1/stores/3/ without any geo params should work)
actual: 404 response — "No Store matches the given query."
errors: 404 NOT_FOUND — "No Store matches the given query."
reproduction: Hit GET http://localhost:8000/api/v1/stores/3/?lat=37.613972&lng=-5.668853&radius_km=20
started: Unknown — likely always been broken for detail view with geo params

## Eliminated

(none — root cause found on first read)

## Evidence

- timestamp: 2026-03-18T00:00:00Z
  checked: backend/apps/stores/views.py — StoreViewSet.get_queryset()
  found: get_queryset() unconditionally requires lat/lng params and filters Store.objects by location__distance_lte=(user_location, D(km=radius_km)). There is no branch for the "retrieve" action. DRF's retrieve() calls get_object() which calls get_queryset(), so the store must be within the specified radius to be found. If the store's coordinates place it outside radius_km from the provided lat/lng, OR if lat/lng are absent entirely, the queryset is empty or raises BargainAPIException, causing a 404.
  implication: The fix is to return Store.objects.filter(is_active=True).select_related("chain") when self.action == "retrieve", bypassing geo filtering entirely for PK-based lookups.

- timestamp: 2026-03-18T00:00:00Z
  checked: favorite() action in same file
  found: favorite() already bypasses get_queryset() by doing Store.objects.get(pk=pk) directly, with a comment "Lookup directamente por pk sin requerir lat/lng"
  implication: The same pattern should be applied to retrieve(), or better yet, get_queryset() should return a plain queryset when action == "retrieve"

## Resolution

root_cause: StoreViewSet.get_queryset() always applies geo filtering regardless of the action. When retrieve() (detail view) uses this queryset to look up a store by PK, the store must also pass the distance filter — but StoreProfileScreen passes lat/lng of the user and the store may be outside the radius, or the store's PostGIS coordinates don't satisfy the filter for that particular point. The `favorite()` action explicitly avoids this by doing a direct Store.objects.get(pk=pk) lookup, but retrieve() does not.
fix: Added early-return branch in get_queryset() — when self.action is "retrieve" or "favorite", returns Store.objects.filter(is_active=True).select_related("chain") with no geo filtering. The geo filter and distance annotation only run for the list action.
verification: All 16 store endpoint integration tests pass (including new test_detail_works_without_location_params replacing the old test that expected 400).
files_changed:
  - backend/apps/stores/views.py
  - backend/tests/integration/test_store_endpoints.py
