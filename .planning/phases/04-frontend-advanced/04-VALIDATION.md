---
phase: 04
slug: frontend-advanced
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x + pytest-django (backend) / jest-expo 54 + @testing-library/react-native (frontend) |
| **Config file** | `backend/pytest.ini` (backend) / `frontend/package.json` jest preset (frontend) |
| **Quick run command** | `cd backend && pytest tests/unit/test_stores.py tests/integration/test_store_endpoints.py -x -v --tb=short` |
| **Full suite command** | `make test-backend && cd frontend && npx jest --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && pytest tests/unit/test_stores.py -x --tb=short`
- **After every plan wave:** Run `make test-backend && cd frontend && npx jest --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STORE-04 | integration | `cd backend && pytest tests/integration/test_store_endpoints.py::test_places_detail_endpoint -x -v` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | STORE-04 | integration | `cd backend && pytest tests/integration/test_store_endpoints.py::test_places_detail_no_place_id -x -v` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | STORE-04 | unit | `cd backend && pytest tests/unit/test_stores.py::test_places_detail_cache_hit -x -v` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | STORE-04 | unit | `cd frontend && npx jest --testPathPattern=MapScreen` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | STORE-04 | unit | `cd frontend && npx jest --testPathPattern=storeService` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/integration/test_store_endpoints.py` — add `test_places_detail_endpoint`, `test_places_detail_no_place_id`, `test_places_detail_silent_fail`
- [ ] `backend/tests/unit/test_stores.py` — add `test_places_detail_cache_hit`
- [ ] `frontend/__tests__/MapScreen.test.tsx` — new file, covers disabled autocomplete bar render
- [ ] `frontend/__tests__/storeService.test.ts` — new file or extend existing, covers `getPlacesDetail` return shape

*Existing test infrastructure covers framework setup — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Autocomplete dropdown visible above MapView on Android | STORE-04 | zIndex/elevation rendering is device-specific | 1. Run on Android device/emulator 2. Tap search bar 3. Verify dropdown appears above map |
| Places discovery markers visually distinct from DB markers | STORE-04 | Visual appearance check | 1. Open native MapScreen 2. Verify grey markers appear 3. Compare against chain-colored markers |
| "Ver en Google Maps" opens external app/browser | STORE-04 | External app launch behavior | 1. Tap Places-only marker 2. Tap "Ver en Google Maps" link 3. Verify Google Maps opens |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
