---
status: awaiting_human_verify
trigger: "Investigate issue: backend-ci-promotions-scraping-imports"
created: 2026-04-10T09:16:33.4019397+02:00
updated: 2026-04-10T09:33:05+02:00
---

## Current Focus

hypothesis: Applied fixes address the reported CI issue clusters; awaiting user confirmation against real CI workflow.
test: Validate with focused and broad backend test runs in Docker.
expecting: Reported 17 failures disappear; only unrelated environment-specific tests may remain in local Docker setup.
next_action: Request user confirmation by rerunning CI pipeline.

## Symptoms

expected: Backend CI test suite should pass without runtime errors or import errors.
actual: 17 tests fail in CI. One integration test crashes creating a promotion due to invalid queryset filter field in notification task. 16 unit tests fail importing bargain_scraping modules.
errors: django.core.exceptions.FieldError: Cannot resolve keyword 'push_notifications_enabled'... choices are created_at,id,store,store_id,user,user_id (from apps/notifications/tasks.py path through promotion creation). Also ModuleNotFoundError: No module named 'bargain_scraping' in backend tests importing spiders/pipelines.
reproduction: Run backend CI tests (pytest in backend context). Specifically failing files include tests/integration/test_promotions.py and tests/unit/test_scraping_pipeline.py, tests/unit/test_scraping_spiders.py.
started: Reported in current CI run (2026-04-10).

## Eliminated

## Evidence

- timestamp: 2026-04-10T09:17:10+02:00
	checked: .planning/debug/knowledge-base.md
	found: No matching known pattern for push_notifications_enabled FieldError or bargain_scraping import failures.
	implication: Continue with fresh hypothesis testing from code evidence.

- timestamp: 2026-04-10T09:18:30+02:00
	checked: code search for push_notifications_enabled and bargain_scraping references in backend/**
	found: apps/notifications/tasks.py filters UserPushToken with push_notifications_enabled; backend tests and apps/scraping/tasks.py import bargain_scraping while package physically exists under scraping/bargain_scraping.
	implication: Strong indication of invalid ORM filter path plus missing import root in backend pytest execution context.

- timestamp: 2026-04-10T09:22:10+02:00
	checked: backend/apps/stores/models.py and backend/apps/notifications/tasks.py
	found: Store.favorited_by points to UserFavoriteStore rows (fields user, store, created_at). notify_new_promo_at_store filters favorited_by with push_notifications_enabled/notify_new_promos directly, which are User fields.
	implication: ORM lookup must use user__push_notifications_enabled and user__notify_new_promos, then dispatch against favorite.user.

- timestamp: 2026-04-10T09:22:10+02:00
	checked: backend/tests/unit/test_scraping_pipeline.py, backend/tests/unit/test_scraping_spiders.py, backend/tests/conftest.py
	found: Scraping tests default SCRAPING_PROJECT_DIR to /scraping only; backend tests global conftest does not add repo-relative scraping path to sys.path.
	implication: In CI/backend contexts without /scraping mount, imports from bargain_scraping fail with ModuleNotFoundError.

- timestamp: 2026-04-10T09:22:10+02:00
	checked: local host pytest execution
	found: Host pytest launcher points to missing Python311 executable, so local host runs are not viable.
	implication: Verification should run through project-supported Docker test commands.

- timestamp: 2026-04-10T09:24:05+02:00
	checked: backend/apps/notifications/tasks.py and backend/tests/conftest.py
	found: Applied fix to query favorites via user__push_notifications_enabled/user__notify_new_promos and dispatch using favorite.user; added global pytest bootstrap to include repo scraping directory on sys.path.
	implication: Both failure clusters now have direct code-level mitigations ready for verification.

- timestamp: 2026-04-10T09:27:10+02:00
	checked: docker compose exec backend pytest tests/integration/test_promotions.py -q
	found: 5 passed; promotions integration no longer raises FieldError.
	implication: Notification queryset fix resolves promotion creation failure path.

- timestamp: 2026-04-10T09:27:10+02:00
	checked: docker compose exec backend pytest tests/unit/test_scraping_pipeline.py tests/unit/test_scraping_spiders.py -q
	found: 22 passed; bargain_scraping imports resolved in backend unit tests.
	implication: Scraping import bootstrap fix resolves ModuleNotFoundError cluster.

- timestamp: 2026-04-10T09:31:35+02:00
	checked: docker compose exec backend pytest -q
	found: 324 passed, 1 failed, 7 errors; all failures confined to test_render_yaml.py looking for /render.yaml inside backend-only Docker mount.
	implication: New fixes did not introduce regressions; remaining failures are unrelated to this bug and environment-specific in this container setup.

- timestamp: 2026-04-10T09:31:35+02:00
	checked: docker compose exec backend pytest -q -k "not render_yaml"
	found: 324 passed, 8 deselected.
	implication: Broader backend behavior is stable after fixes when excluding known render.yaml path assumptions.

- timestamp: 2026-04-10T09:33:05+02:00
	checked: docker compose exec backend ruff check apps/notifications/tasks.py tests/conftest.py
	found: All checks passed.
	implication: Edited files are lint-clean.

## Resolution

root_cause: notify_new_promo_at_store used User fields directly on Store.favorited_by (UserFavoriteStore queryset), causing FieldError; backend pytest lacked deterministic bootstrap of repo scraping path, causing ModuleNotFoundError for bargain_scraping in scraping unit tests.
fix: Corrected notification queryset to traverse UserFavoriteStore->user fields and added backend pytest bootstrap for repo scraping import path.
verification: Focused failing suites passed (5/5 promotions integration and 22/22 scraping unit tests). Broad pass excluding unrelated render.yaml path tests yielded 324/324 passing selected tests.
files_changed:
	- backend/apps/notifications/tasks.py
	- backend/tests/conftest.py
