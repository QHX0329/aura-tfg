# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## frontend-ci-lint-import-no-unresolved - Frontend CI lint unresolved imports due to missing frontend/web install
- **Date:** 2026-04-10
- **Error patterns:** import/no-unresolved, frontend ci lint, frontend/web, e2e, @playwright/test, react-router-dom, antd, @ant-design/icons, framer-motion, lucide-react, dayjs, vitest, @testing-library/jest-dom
- **Root cause:** ci-frontend workflow installed only frontend dependencies while eslint . scanned frontend/web and e2e files that import packages defined in frontend/web package manifest.
- **Fix:** Updated ci-frontend workflow to install dependencies for both frontend and frontend/web and include both lockfiles in npm cache-dependency-path.
- **Files changed:** .github/workflows/ci-frontend.yml
---

## frontend-workflow-prettier-check-fails - Frontend workflow Prettier check failed due to formatting drift in 8 files
- **Date:** 2026-04-10
- **Error patterns:** prettier --check, code style issues found in 8 files, npm run format, lint passes format fails, src/api/client.ts, src/utils/maps.ts
- **Root cause:** Eight frontend source files had drifted from the configured Prettier formatting, causing prettier --check to emit warnings and exit with code 1.
- **Fix:** Ran a targeted prettier write on the 8 reported files and rechecked with npm run lint and npm run format.
- **Files changed:** frontend/src/api/client.ts, frontend/src/api/optimizerService.ts, frontend/src/api/storeService.ts, frontend/src/screens/home/ProductProposalScreen.tsx, frontend/src/screens/lists/RouteScreen.tsx, frontend/src/screens/map/StoreProfileScreen.tsx, frontend/src/services/lockscreenChecklistService.ts, frontend/src/utils/maps.ts
---
