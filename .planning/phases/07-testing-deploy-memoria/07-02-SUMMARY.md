---
phase: 07-testing-deploy-memoria
plan: 02
subsystem: frontend/web (E2E testing)
tags: [playwright, e2e, testing, auth, business, optimizer, ocr]
dependency_graph:
  requires: []
  provides: [playwright-e2e-setup, auth-e2e-flow, business-e2e-flow, optimizer-api-e2e, ocr-api-e2e]
  affects: [docs/memoria/10-pruebas.md]
tech_stack:
  added: ["@playwright/test ^1.59.1", "Chromium 147.0.7727.15"]
  patterns: ["Playwright request fixture para API-level flows", "webServer autostart para UI flows"]
key_files:
  created:
    - frontend/web/playwright.config.ts
    - frontend/web/e2e/auth.spec.ts
    - frontend/web/e2e/business.spec.ts
    - frontend/web/e2e/optimizer.spec.ts
    - frontend/web/e2e/ocr.spec.ts
    - frontend/web/e2e/fixtures/ticket-test.jpg
  modified:
    - frontend/web/package.json
    - frontend/web/.gitignore
decisions:
  - "Flujos auth y business son UI-driven (web companion tiene /login, /onboarding, /dashboard)"
  - "Flujos optimizer y OCR son API-level via request fixture (pantallas de lista/cámara son móviles)"
  - "business.spec.ts tipado p: { user?: { email: string }; business_email?: string } para evitar any"
  - "Fixture JPEG mínimo (1x1 px) versionado en e2e/fixtures/ para independencia de archivos externos"
metrics:
  duration_seconds: 262
  completed_date: "2026-04-09"
  tasks_completed: 6
  files_created: 6
  files_modified: 2
---

# Phase 7 Plan 02: Playwright E2E Setup — Summary

**One-liner:** Playwright 1.59 instalado en web companion con 4 spec files (auth UI-driven, business UI-driven, optimizer API-level, OCR API-level) listos para ejecutar contra el backend Docker local.

---

## Resultado de `npx playwright test --list`

```
Listing tests:
  [chromium] › auth.spec.ts:18:3 › Auth flow › register → login → token refresh → logout
  [chromium] › business.spec.ts:18:3 › Business portal flow › PYME onboarding → admin approval → price visible
  [chromium] › ocr.spec.ts:37:3 › OCR API flow › enviar imagen → OCR endpoint responde con estructura esperada
  [chromium] › optimizer.spec.ts:37:3 › Optimizer API flow › crear lista con items → optimizar → resultado con ruta
Total: 4 tests in 4 files
```

---

## Archivos creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `frontend/web/playwright.config.ts` | Config | baseURL localhost:5173, webServer Vite, Chromium, workers=1 |
| `frontend/web/e2e/auth.spec.ts` | Spec UI | Flujo 1: register API → login UI → token localStorage → refresh → logout |
| `frontend/web/e2e/business.spec.ts` | Spec UI | Flujo 4: PYME onboarding UI → admin approve API → dashboard UI |
| `frontend/web/e2e/optimizer.spec.ts` | Spec API | Flujo 2: register → lista → items → POST optimizer/optimize/ → 200/202 |
| `frontend/web/e2e/ocr.spec.ts` | Spec API | Flujo 3: register → POST ocr/scan/ multipart → 200/422 |
| `frontend/web/e2e/fixtures/ticket-test.jpg` | Fixture | JPEG mínimo 1x1 px blanco (278 bytes) para test OCR |

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/web/package.json` | `@playwright/test ^1.59.1` en devDependencies, scripts `test:e2e` y `test:e2e:ui` |
| `frontend/web/.gitignore` | Añadidos `playwright-report/` y `test-results/` |

---

## Razón API-level vs UI-driven

| Flujo | Tipo | Justificación |
|-------|------|---------------|
| auth.spec.ts | UI-driven | /login y /register existen en el web companion |
| business.spec.ts | UI-driven | /onboarding y /dashboard existen en el web companion |
| optimizer.spec.ts | API-level | Las páginas de lista de la compra son exclusivas de la app móvil |
| ocr.spec.ts | API-level | La cámara física es exclusiva del móvil (D-09 — UAT manual) |

Esta distinción justifica en Cap. 10 de la memoria por qué los flujos 2 y 3 usan `request` fixture
en lugar de browser pages: el web companion es un portal business, no una app consumer.

---

## Instrucciones para ejecutar

```bash
# Prerequisito: backend Docker corriendo
make dev  # desde la raíz del repo

# Listar tests (no requiere backend)
cd frontend/web && npx playwright test --list

# Ejecutar suite completa (requiere backend + Vite autoarranca)
cd frontend/web && npx playwright test

# Solo auth (más rápido para verificar setup)
cd frontend/web && npx playwright test e2e/auth.spec.ts --reporter=list

# Ver reporte HTML tras ejecución
cd frontend/web && npx playwright show-report
```

**Variables de entorno opcionales** (si se quieren usar credenciales específicas):
```
PLAYWRIGHT_BASE_URL=http://localhost:5173
PLAYWRIGHT_API_URL=http://localhost:8000/api/v1
TEST_USER_EMAIL=...
TEST_USER_PASSWORD=...
TEST_ADMIN_EMAIL=admin@bargain.local
TEST_ADMIN_PASSWORD=...
```

**Nota:** Los tests crean usuarios nuevos con timestamp en cada ejecución → no se pisan entre sí.
Los tests apuntan al backend Docker local o staging — nunca a producción.

---

## Commits

| Hash | Descripción |
|------|-------------|
| `4475184` | chore(07-02): instalar @playwright/test en web companion |
| `82464b7` | chore(07-02): configurar Playwright con playwright.config.ts |
| `e68a992` | test(07-02): añadir flujo E2E de autenticación completa |
| `fbbed88` | test(07-02): añadir flujo E2E del portal business |
| `62f2743` | test(07-02): añadir flujo E2E del optimizador (API-level) |
| `0110bdb` | test(07-02): añadir flujo E2E de OCR (API-level) con fixture JPEG |

---

## Deviations from Plan

None — plan executed exactly as written.

Minor adjustment: `business.spec.ts` usa tipo explícito `p: { user?: { email: string }; business_email?: string }` en lugar de `p: any` para cumplir convenciones TypeScript del proyecto (CLAUDE.md).

---

## Known Stubs

None — los spec files están completamente implementados. Los tests requieren backend corriendo para ejecutarse (no son stubs de implementación).

## Self-Check: PASSED
