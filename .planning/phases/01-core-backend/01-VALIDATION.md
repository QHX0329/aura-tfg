---
phase: 1
slug: core-backend
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
updated: 2026-03-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x + pytest-django 4.x |
| **Config file** | `backend/pytest.ini` |
| **Quick run command** | `make test-backend` (docker) |
| **Full suite command** | `make test-backend-cov` (docker) |
| **Total tests** | 179 |
| **Last run result** | ✅ 179/179 passed |

---

## Sampling Rate

- **After every task commit:** Run `make test-backend` inside Docker
- **After every plan wave:** Full suite must be green
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Requirement | Test File | Test Class | Status |
|---------|------|-------------|-----------|------------|--------|
| 1-01-01 | 01 | AUTH-01..05 (unit) | `tests/unit/test_users.py` | — | ✅ green |
| 1-01-02 | 01 | AUTH-01 (register) | `tests/integration/test_auth_endpoints.py` | `TestRegistration` | ✅ green |
| 1-01-03 | 01 | AUTH-02 (login) | `tests/integration/test_auth_endpoints.py` | `TestLogin`, `TestTokenRefresh` | ✅ green |
| 1-01-04 | 01 | AUTH-03 (pwd reset) | `tests/integration/test_auth_endpoints.py` | `TestPasswordReset` | ✅ green |
| 1-01-05 | 01 | AUTH-04, AUTH-05 (profile) | `tests/integration/test_auth_endpoints.py` | `TestProfile` | ✅ green |
| 1-02-01 | 02 | PROD-01..05 (unit) | `tests/unit/test_products.py` | — | ✅ green |
| 1-02-02 | 02 | PROD-01, PROD-03 (search) | `tests/integration/test_product_endpoints.py` | `TestProductSearch`, `TestAutocomplete` | ✅ green |
| 1-02-03 | 02 | PROD-02 (detail) | `tests/integration/test_product_endpoints.py` | `TestProductDetail` | ✅ green |
| 1-02-04 | 02 | PROD-04 (categories) | `tests/integration/test_product_endpoints.py` | `TestCategories` | ✅ green |
| 1-02-05 | 02 | PROD-05 (proposals) | `tests/integration/test_product_endpoints.py` | `TestProposals` | ✅ green |
| 1-03-01 | 03 | STORE-01..04 (unit) | `tests/unit/test_stores.py` | — | ✅ green |
| 1-03-02 | 03 | STORE-01 (nearby) | `tests/integration/test_store_endpoints.py` | `TestNearbyStores` | ✅ green |
| 1-03-03 | 03 | STORE-02 (detail) | `tests/integration/test_store_endpoints.py` | `TestStoreDetail` | ✅ green |
| 1-03-04 | 03 | STORE-03 (serializer) | `tests/unit/test_stores.py` | — | ✅ green |
| 1-03-05 | 03 | STORE-04 (favorites) | `tests/integration/test_store_endpoints.py` | `TestFavorites` | ✅ green |
| 1-04-01 | 04 | PRICE-01..05 (unit) | `tests/unit/test_prices.py` | — | ✅ green |
| 1-04-02 | 04 | PRICE-01 (compare) | `tests/integration/test_price_endpoints.py` | `TestPriceCompare` | ✅ green |
| 1-04-03 | 04 | PRICE-02 (list total) | `tests/integration/test_price_endpoints.py` | `TestListTotal` | ✅ green |
| 1-04-04 | 04 | PRICE-03 (history) | `tests/integration/test_price_endpoints.py` | `TestPriceHistory` | ✅ green |
| 1-04-05 | 04 | PRICE-04 (alert task) | `tests/unit/test_prices.py` | — | ✅ green |
| 1-04-06 | 04 | PRICE-05 (crowdsource) | `tests/integration/test_price_endpoints.py` | `TestCrowdsource` | ✅ green |
| 1-05-01 | 05 | LIST-01..04 (unit) | `tests/unit/test_shopping_lists.py` | — | ✅ green |
| 1-05-02 | 05 | LIST-01 (limit) | `tests/integration/test_list_endpoints.py` | `TestListLimit` | ✅ green |
| 1-05-03 | 05 | LIST-02 (items) | `tests/integration/test_list_endpoints.py` | `TestListItems` | ✅ green |
| 1-05-04 | 05 | LIST-03 (collaborators) | `tests/integration/test_list_endpoints.py` | `TestCollaborators` | ✅ green |
| 1-05-05 | 05 | LIST-04 (templates) | `tests/integration/test_list_endpoints.py` | `TestTemplates` | ✅ green |
| 1-06-01 | 06 | ALL (cross-domain) | `tests/integration/test_cross_domain.py` | `TestHappyPath` | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/factories.py` — factory-boy factories (User, Product, Store, Price, ShoppingList)
- [x] `backend/tests/integration/test_auth_endpoints.py` — AUTH-01..05
- [x] `backend/tests/integration/test_product_endpoints.py` — PROD-01..05
- [x] `backend/tests/integration/test_store_endpoints.py` — STORE-01..04
- [x] `backend/tests/integration/test_price_endpoints.py` — PRICE-01..05
- [x] `backend/tests/integration/test_list_endpoints.py` — LIST-01..04
- [x] `backend/tests/unit/test_stores.py`
- [x] `backend/tests/unit/test_prices.py`
- [x] `backend/apps/scraping/tasks.py` — `run_spider` stub

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email delivery for password reset | AUTH-03 | Requires real SMTP | Use `django.test.mail.outbox` in integration test |
| PostGIS distance ordering accuracy | STORE-01 | Requires spatial fixtures | Use `seville_point` fixture; verify ascending distance order |

---

## Validation Sign-Off

- [x] All tasks have automated verify
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 all complete
- [x] No watch-mode flags
- [x] Feedback latency < 60s (179 tests ~60s in Docker)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ 2026-03-17

---

## Validation Audit 2026-03-17

| Metric | Count |
|--------|-------|
| Tasks mapped | 27 |
| Gaps found | 0 |
| Resolved | 0 |
| Manual-only | 2 |
| Total tests | 179 |
| Pass rate | 100% |
