---
phase: 6
slug: portal-business-app-movil
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-05
audited: 2026-04-05
---

# Phase 6 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x + pytest-django |
| **Config file** | `backend/pytest.ini` |
| **Backend quick run** | `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py tests/integration/test_bulk_prices.py -q --tb=short` |
| **Backend full suite** | `make test-backend` |
| **Service import check** | `docker exec bargain-backend python manage.py shell -c "from apps.products.services import approve_proposal; print('OK')"` |
| **Frontend contract check** | `cd frontend && npx tsc --noEmit --project tsconfig.json` |
| **Estimated runtime** | ~10-15 seconds for targeted backend checks; ~2 minutes full suite |
| **Note** | `MainTabs.tsx` still has preexisting TypeScript errors unrelated to F6, documented as baseline and deferred to F7. |

---

## Sampling Rate

- **After every task commit:** Run `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py tests/integration/test_bulk_prices.py -q --tb=short`
- **After every plan wave:** Run `make test-backend`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 minutes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-svc-01 | 06-01 | 1 | SVC-01 | service | `docker exec bargain-backend python manage.py shell -c "from apps.products.services import approve_proposal; print('OK')"` | ✅ | ✅ green |
| 6-pro-01 | 06-02 | 2 | PRO-01 | integration | `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py::TestProposalAdminApprove::test_approve_proposal_creates_product_and_price -q --tb=short` | ✅ | ✅ green |
| 6-pro-02 | 06-02 | 2 | PRO-02 | integration | `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py::TestProposalAdminReject::test_reject_proposal_with_reason -q --tb=short` | ✅ | ✅ green |
| 6-pro-03 | 06-02 | 2 | PRO-03 | integration | `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py::TestProposalAdminApprove::test_non_admin_cannot_approve -q --tb=short` | ✅ | ✅ green |
| 6-pro-04 | 06-02 | 2 | PRO-04 | integration | `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py::TestProposalAdminApprove::test_approve_already_approved_returns_400 -q --tb=short` | ✅ | ✅ green |
| 6-bulk-01 | 06-03 | 1 | BULK-01 | integration | `docker exec bargain-backend pytest tests/integration/test_bulk_prices.py::TestBulkPriceUpdate::test_bulk_update_valid_rows -q --tb=short` | ✅ | ✅ green |
| 6-bulk-02 | 06-03 | 1 | BULK-02 | integration | `docker exec bargain-backend pytest tests/integration/test_bulk_prices.py::TestBulkPriceUpdate::test_bulk_update_store_not_owned -q --tb=short` | ✅ | ✅ green |
| 6-uat-01 | 06-04 | 3 | UAT-01 | manual/e2e | `N/A - approved in 06-UAT.md` | ✅ | ⚠️ manual-approved |
| 6-uat-02 | 06-04 | 3 | UAT-02 | manual/e2e | `N/A - approved in 06-UAT.md` | ✅ | ⚠️ manual-approved |
| 6-uat-03 | 06-04 | 3 | UAT-03 | manual/e2e | `N/A - approved in 06-UAT.md` | ✅ | ⚠️ manual-approved |
| 6-doc-01 | 06-05 | 4 | DOC-01 | docs | `Get-Item .planning/STATE.md,.planning/ROADMAP.md,TASKS.md,.planning/phases/06-portal-business-app-movil/06-UAT.md` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ manual-approved*

---

## Wave 0 Requirements

- [x] `backend/tests/integration/test_proposal_admin.py` - covers PRO-01, PRO-02, PRO-03, PRO-04
- [x] `backend/apps/products/services.py` - covers SVC-01 service extraction/import path
- [x] `backend/tests/integration/test_bulk_prices.py` - covers BULK-01, BULK-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile app: create product proposal end-to-end | UAT-01 | Requires authenticated Expo client, device/session state, and live backend | Open mobile app, submit a proposal, confirm it is created in pending state |
| Admin portal: approve/reject proposal end-to-end | UAT-02 | Requires admin web session and visual confirmation in UI/catalog | Open admin page, approve one proposal and reject another with reason, confirm expected UI/data changes |
| Business portal: import CSV prices end-to-end | UAT-03 | Requires verified business user and real CSV/product/store IDs | Import CSV from Prices page and verify created/updated counts plus row-level errors |

Manual checkpoint result: `approved`

---

## Validation Sign-Off

- [x] All automated backend gaps identified in Wave 0 are now covered
- [x] Sampling continuity is preserved for backend-critical tasks
- [x] Full backend suite passed during phase execution (`321 passed`)
- [x] Manual-only UAT requirements are explicitly documented and approved
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (2026-04-05)

---

## Validation Audit 2026-04-05

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Manual-only requirements | 3 |
| Automated backend checks re-run | 11 tests |

