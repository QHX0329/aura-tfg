---
status: resolved
trigger: "Investigate issue: frontend-ci-lint-import-no-unresolved"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:30:00Z
---

## Current Focus

hypothesis: CI unresolved-import failures were caused by missing frontend/web dependency install in ci-frontend.
test: Local human verification already confirms lint returns 0 errors after workflow update.
expecting: CI should pass lint import resolution once changes are pushed.
next_action: Archive session and update debug knowledge base entry.

## Symptoms

expected: Frontend lint job should pass in CI with zero errors.
actual: Lint reports unresolved imports for packages used under frontend/web and e2e tests, plus a few warnings (unused var and Array<T> style).
errors: import/no-unresolved for modules like @playwright/test, react-router-dom, antd, @ant-design/icons, framer-motion, lucide-react, dayjs, vitest, @testing-library/jest-dom. Warning in frontend/__tests__/MapScreen.test.tsx for unused mockResolvedWithMatch. Warnings in frontend/web src files for Array<T> style.
reproduction: In repo root run cd frontend then npm run lint.
started: Observed in current CI run on April 10, 2026.

## Eliminated

## Evidence

- timestamp: 2026-04-10T00:01:00Z
	checked: .planning/debug/knowledge-base.md
	found: Knowledge base file does not exist yet (no prior debug patterns available).
	implication: Continue with fresh investigation and independent hypotheses.

- timestamp: 2026-04-10T00:05:00Z
	checked: frontend lint reproduction via npm run lint
	found: Lint reports 0 errors and 4 warnings locally (unused var in __tests__/MapScreen.test.tsx and three Array<T> style warnings in frontend/web/src files).
	implication: Reported 44 import/no-unresolved failures are likely CI-environment-specific, not deterministic in current local workspace.

- timestamp: 2026-04-10T00:08:00Z
	checked: .github/workflows/ci-frontend.yml install and lint steps
	found: Workflow runs npm ci only in frontend, then runs npm run lint where lint script is eslint .
	implication: CI lint traverses frontend/web and frontend/web/e2e without installing frontend/web dependencies.

- timestamp: 2026-04-10T00:11:00Z
	checked: unresolved module ownership against frontend/package.json and frontend/web/package.json
	found: Modules like @playwright/test, react-router-dom, antd, framer-motion, lucide-react, dayjs, vitest, and @testing-library/jest-dom exist in web manifest and not in frontend root manifest.
	implication: Missing frontend/web install in CI directly explains import/no-unresolved errors.

- timestamp: 2026-04-10T00:12:00Z
	checked: frontend/web/package-lock.json existence
	found: frontend/web/package-lock.json is present.
	implication: npm ci can be safely added for frontend/web in CI workflow.

- timestamp: 2026-04-10T00:17:00Z
	checked: frontend lint rerun after workflow update
	found: npm run lint reports 0 errors and 4 warnings.
	implication: Local lint is stable and does not reproduce unresolved-import failures after fix.

- timestamp: 2026-04-10T00:30:00Z
	checked: user checkpoint response (human verification)
	found: User confirmed local verification complete; frontend lint now returns 0 errors and 4 warnings.
	implication: Fix is validated in local workflow and session can be finalized pending remote CI run after push.

## Resolution

root_cause:
	ci-frontend workflow installed only frontend dependencies while eslint . scanned frontend/web and e2e files that import packages defined in frontend/web package manifest.
fix:
	Updated ci-frontend workflow to install dependencies for both frontend and frontend/web and include both lockfiles in npm cache-dependency-path.
verification:
	Human-verified locally: cd frontend && npm run lint returns 0 errors and 4 warnings.
files_changed: [.github/workflows/ci-frontend.yml]
