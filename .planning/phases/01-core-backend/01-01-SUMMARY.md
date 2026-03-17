---
phase: 01-core-backend
plan: "01"
subsystem: users-auth
tags: [auth, jwt, users, tdd, rest-api]
dependency_graph:
  requires: []
  provides:
    - apps.users.serializers (UserRegistrationSerializer, UserProfileSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer)
    - apps.users.views (UserRegistrationView, CustomTokenObtainPairView, CustomTokenRefreshView, PasswordResetRequestView, PasswordResetConfirmView, UserProfileViewSet)
    - apps.users.urls (register, token, token/refresh, password-reset, profile)
    - apps.core.responses (success_response, created_response)
    - tests.factories (UserFactory, CategoryFactory, ProductFactory, StoreFactory, PriceFactory, ShoppingListFactory)
  affects:
    - All subsequent plans that import from tests.factories
    - All plans that call success_response / created_response
tech_stack:
  added:
    - djangorestframework-simplejwt (JWT auth with rotation + blacklist)
    - factory_boy (test factories with lazy model resolution)
  patterns:
    - Anti-enumeration on password reset (always returns 200)
    - Success envelope: {"success": true, "data": ...}
    - Error envelope: {"success": false, "error": {"code", "message", "details"}}
    - JWT: 5min access / 30day refresh with rotation
key_files:
  created:
    - backend/apps/users/serializers.py
    - backend/apps/users/views.py
    - backend/apps/users/admin.py
    - backend/apps/core/responses.py
    - backend/tests/factories.py
    - backend/tests/unit/test_users.py
    - backend/tests/integration/test_auth_endpoints.py
  modified:
    - backend/apps/users/urls.py
    - backend/apps/scraping/tasks.py
    - backend/config/settings/base.py
decisions:
  - "JWT access token lifetime set to 5 minutes (plan requirement); .env updated to match"
  - "Email uniqueness validated in serializer (not DB constraint) since AbstractUser lacks unique email by default"
  - "Factories use _lazy_model() helper to defer Django model lookups until models are defined in later plans"
  - "UserProfileViewSet uses /me/ endpoint (DefaultRouter basename=profile + retrieve returns request.user)"
metrics:
  duration_minutes: 10
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_created: 7
  files_modified: 3
  tests_added: 36
---

# Phase 1 Plan 01: Users & Authentication Module Summary

**One-liner:** JWT auth with 5min/30day rotation, password reset, user profile, and lazy test factories using django-simplejwt + factory-boy.

## What Was Built

Complete REST authentication API covering registration, JWT login/refresh (with blacklist rotation), password reset via console email, and user profile management. Also established the shared test infrastructure (factories, success_response helper) used by all Phase 1 plans.

### Endpoints Implemented

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/v1/auth/register/ | None | Register new user |
| POST | /api/v1/auth/token/ | None | Obtain JWT pair |
| POST | /api/v1/auth/token/refresh/ | None | Rotate refresh token |
| POST | /api/v1/auth/password-reset/ | None | Request password reset (anti-enumeration) |
| POST | /api/v1/auth/password-reset/confirm/ | None | Confirm reset with uid+token |
| GET | /api/v1/auth/profile/me/ | Bearer | Get own profile |
| PATCH | /api/v1/auth/profile/me/ | Bearer | Update profile fields |
| PUT | /api/v1/auth/profile/me/ | Bearer | Full profile update |

## Test Results

- **36 tests total, 36 passing**
- 8 unit tests (serializer validation)
- 14 integration tests (endpoint behavior)
- 14 foundation tests (settings, stub, helpers, factory imports)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Validation] Added email uniqueness check to UserRegistrationSerializer**
- **Found during:** Task 2 GREEN phase — `test_register_duplicate_email_returns_400` failed (201 returned)
- **Issue:** Django's `AbstractUser` does not enforce email uniqueness at the DB level, so duplicate email registrations succeeded.
- **Fix:** Added `validate_email()` method performing a case-insensitive `email__iexact` lookup before creating the user.
- **Files modified:** `backend/apps/users/serializers.py`
- **Commit:** `9473ac9`

**2. [Rule 3 - Blocking] Updated .env JWT values to match new defaults**
- **Found during:** Task 1 GREEN phase — JWT settings tests read env vars at import time; old `.env` values (60min/7d) overrode the new defaults (5min/30d).
- **Fix:** Updated `.env` `JWT_ACCESS_TOKEN_LIFETIME_MINUTES=5` and `JWT_REFRESH_TOKEN_LIFETIME_DAYS=30`; force-recreated Docker container to pick up new env.
- **Files modified:** `.env` (gitignored)
- **Commit:** N/A (.env is gitignored)

**3. [Rule 2 - Pattern] Lazy model resolution in factories.py**
- **Found during:** Task 1 — factory-boy resolves string model names at class definition time via `django.apps.get_model()`, which raises `LookupError` for models not yet defined (products, stores, prices, shopping_lists).
- **Fix:** Added `_lazy_model(app_label, model_name)` helper that catches `LookupError` and returns a placeholder class, making the factories importable until the real models are created.
- **Files modified:** `backend/tests/factories.py`
- **Commit:** `fedc247`

## Self-Check: PASSED

All created files exist on disk. Both task commits confirmed in git log.

| Item | Status |
|------|--------|
| backend/apps/users/serializers.py | FOUND |
| backend/apps/users/views.py | FOUND |
| backend/apps/users/admin.py | FOUND |
| backend/apps/users/urls.py | FOUND |
| backend/apps/core/responses.py | FOUND |
| backend/tests/factories.py | FOUND |
| backend/tests/unit/test_users.py | FOUND |
| backend/tests/integration/test_auth_endpoints.py | FOUND |
| Commit fedc247 (Task 1) | FOUND |
| Commit 9473ac9 (Task 2) | FOUND |
