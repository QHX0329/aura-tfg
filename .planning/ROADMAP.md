# Roadmap: BargAIn

## Overview

Roadmap operativo sincronizado a 2026-04-05. El proyecto tiene F1-F5 finalizadas, F6 planificada (5 planes en 3 oleadas) y F7 pendiente.

## Phase Status

- [x] Phase 1: Core Backend (F3) - Completada
- [x] Phase 2: Business & Notifications - Completada
- [x] Phase 3: Frontend Base + Integraciones clave - Completada a nivel de bloque inicial
- [x] Phase 4: Frontend advanced polish y cierre F4 - Completada (2026-03-23)
- [x] Phase 5: Optimizer, Scraping, OCR, LLM - Completada (5 planes)
- [ ] Phase 6: Portal Business y App Movil - cierre de flujos, tests, UAT, sync docs - En curso
- [ ] Phase 7: Testing final, Deploy, Memoria y Defensa - Pendiente

## Current Execution Focus

### Phase 4 (complete)

**Goal:** Complete Google Places integration (F4-21) to close Phase 4.

**Requirements:** [STORE-04]

**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md — Backend Places enrichment proxy (Store model + endpoint + Redis cache + tests)
- [x] 04-02-PLAN.md — Frontend Places integration (autocomplete + discovery markers + StoreProfile enrichment)

### Phase 5 (complete)

**Goal:** Build the four remaining backend systems (optimizer, scraping, OCR, LLM) and wire them to the three frontend screens currently running on mock data.

**Requirements:** [OPT-01, OPT-02, OPT-03, OPT-04, OCR-01, OCR-02, LLM-01, LLM-02, SCRAP-01, NFR-01]

**Plans:** 5/5 plans complete

Plans:
- [x] 05-01-PLAN.md — Scrapy spiders (Mercadona/Carrefour/Lidl/DIA) + pipeline + Celery Beat schedule
- [x] 05-02-PLAN.md — OCR backend endpoint (actualmente legado con pytesseract; decision vigente: Google Vision API + fuzzy matching)
- [x] 05-03-PLAN.md — LLM assistant endpoint (Claude API proxy + guardrails)
- [x] 05-04-PLAN.md — Optimizer algorithm (Graphhopper + OR-Tools + OptimizationResult model)
- [x] 05-05-PLAN.md — Frontend wiring (RouteScreen + OCRScreen + AssistantScreen to real endpoints)

### Phase 6 (active)

**Goal:** Cerrar todos los flujos del Portal Business y App Movil: servicio de aprobacion compartido, tests de integracion para propuestas y precios bulk, UAT manual, sync de documentacion.

**Requirements:** [SVC-01, PRO-01, PRO-02, PRO-03, PRO-04, BULK-01, BULK-02, UAT-01, UAT-02, UAT-03, DOC-01]

**Plans:** 5 plans

Plans:
- [ ] 06-01-PLAN.md — Shared approval service (services.py extraction + views.py + admin.py update)
- [ ] 06-02-PLAN.md — Integration tests: proposal admin (6 tests)
- [ ] 06-03-PLAN.md — Integration tests: CSV bulk-update (5 tests)
- [ ] 06-04-PLAN.md — UAT verification and frontend bug fixes
- [ ] 06-05-PLAN.md — Sync documentation and planning

### Phase 7 (closure)

- E2E global y validacion de requisitos no funcionales.
- Deploy de staging definitivo.
- Cierre de memoria del TFG y preparacion de defensa.

## Progress Table

| Phase | Status | Notes |
|------|--------|-------|
| 1. Core Backend | Complete | Base backend y API consolidada |
| 2. Business & Notifications | Complete | Portal PYME + notificaciones listas |
| 3. Frontend | Complete (baseline) | Pantallas y flujos clave operativos |
| 4. Frontend Advanced | Complete | Google Places integration done (2 plans, 2 waves) |
| 5. IA + Optimizer + Scraping | Complete | 5 plans — scraping/OCR/LLM/optimizer/frontend |
| 6. Business Portal + Mobile App | In progress | Service extraction, 11 integration tests, UAT, docs sync |
| 7. Final QA + Deploy + Thesis | Not started | Cierre de proyecto |

---
Last updated: 2026-04-05
