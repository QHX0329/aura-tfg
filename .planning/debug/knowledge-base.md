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
