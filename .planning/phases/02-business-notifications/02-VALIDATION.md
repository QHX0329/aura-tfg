---
phase: 2
slug: business-notifications
status: compliant
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-17
audited: 2026-03-17
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x + pytest-django |
| **Config file** | `backend/pytest.ini` |
| **Quick run command** | `docker compose -f docker-compose.dev.yml exec backend pytest tests/ -x -q --tb=short` |
| **Full suite command** | `docker compose -f docker-compose.dev.yml exec backend pytest tests/ -v --tb=short --cov=apps --cov-report=term` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BIZ-01 | unit | `pytest tests/unit/test_business_models.py -x -q` | ✅ | ✅ green |
| 02-01-02 | 01 | 1 | BIZ-01 | integration | `pytest tests/integration/test_business_registration.py -x -q` | ✅ | ✅ green |
| 02-01-03 | 01 | 2 | BIZ-01 | integration | `pytest tests/integration/test_business_verification.py -x -q` | ✅ | ✅ green |
| 02-01-04 | 01 | 2 | BIZ-02 | integration | `pytest tests/integration/test_business_prices.py -x -q` | ✅ | ✅ green |
| 02-01-05 | 01 | 2 | BIZ-03 | integration | `pytest tests/integration/test_promotions.py -x -q` | ✅ | ✅ green |
| 02-02-01 | 02 | 3 | NOTIF-01 | unit | `pytest tests/unit/test_notifications_models.py -x -q` | ✅ | ✅ green |
| 02-02-02 | 02 | 3 | NOTIF-01 | integration | `pytest tests/integration/test_notification_dispatch.py -x -q` | ✅ | ✅ green |
| 02-02-03 | 02 | 3 | NOTIF-01 | integration | `pytest tests/integration/test_notification_events.py -x -q` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/unit/test_business_models.py` — 11 tests (BIZ-01 model coverage)
- [x] `tests/integration/test_business_registration.py` — 4 tests (registration + profile API)
- [x] `tests/integration/test_business_verification.py` — 4 tests (admin approve/reject flow)
- [x] `tests/integration/test_business_prices.py` — 3 tests (BIZ-02 price update API)
- [x] `tests/integration/test_promotions.py` — 5 tests (BIZ-03 promotion CRUD + Celery auto-deactivation)
- [x] `tests/unit/test_notifications_models.py` — 11 tests (NOTIF-01 Notification + UserPushToken models)
- [x] `tests/integration/test_notification_dispatch.py` — 5 tests (Celery dispatch tasks, mocked Expo API)
- [x] `tests/integration/test_notification_events.py` — 5 tests (event triggers: price alert, promo, shared list)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expo push delivery to real device | NOTIF-01 | Requires physical device with Expo Go | Install Expo Go, register token, trigger price alert, confirm notification received |
| Email received via SMTP in staging | NOTIF-01 | Requires real SMTP credentials | Configure staging SMTP, trigger business approval, verify email received |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 45s (actual: 13.6s for 48 tests)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-03-17

---

## Validation Audit 2026-03-17

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated to manual | 2 |
| Total tests | 48 (all green) |
| Runtime | 13.6s |
