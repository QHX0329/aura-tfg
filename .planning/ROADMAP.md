# Roadmap: BargAIn

## Overview

Roadmap operativo sincronizado a 2026-03-21. El proyecto tiene F1, F2 y F3 finalizadas, F4 en progreso avanzado y F5-F6 pendientes.

## Phase Status

- [x] Phase 1: Core Backend (F3) - Completada
- [x] Phase 2: Business & Notifications - Completada
- [x] Phase 3: Frontend Base + Integraciones clave - Completada a nivel de bloque inicial
- [ ] Phase 4: Frontend advanced polish y cierre F4 - En progreso
- [ ] Phase 5: Optimizer, Scraping, OCR, LLM - Pendiente
- [ ] Phase 6: Testing final, Deploy, Memoria y Defensa - Pendiente

## Current Execution Focus

### Phase 4 (active)

**Goal:** Complete Google Places integration (F4-21) to close Phase 4.

**Requirements:** [STORE-04]

**Plans:** 1/2 plans executed

Plans:
- [x] 04-01-PLAN.md — Backend Places enrichment proxy (Store model + endpoint + Redis cache + tests)
- [ ] 04-02-PLAN.md — Frontend Places integration (autocomplete + discovery markers + StoreProfile enrichment)

### Phase 5 (next)

- Spiders productivos (Mercadona, Carrefour, Lidl, DIA).
- Pipeline de normalizacion y programacion de scraping.
- Algoritmo multicriterio y rutas con OR-Tools + distancias reales.
- OCR backend con matching fuzzy.
- Integracion del asistente LLM con guardrails.

### Phase 6 (closure)

- E2E global y validacion de requisitos no funcionales.
- Deploy de staging definitivo.
- Cierre de memoria del TFG y preparacion de defensa.

## Progress Table

| Phase | Status | Notes |
|------|--------|-------|
| 1. Core Backend | Complete | Base backend y API consolidada |
| 2. Business & Notifications | Complete | Portal PYME + notificaciones listas |
| 3. Frontend | Complete (baseline) | Pantallas y flujos clave operativos |
| 4. Frontend Advanced | In progress | F4-21 (Google Places) planned — 2 plans in 2 waves |
| 5. IA + Optimizer + Scraping | Not started | Bloque tecnico critico pendiente |
| 6. Final QA + Deploy + Thesis | Not started | Cierre de proyecto |

---
Last updated: 2026-03-21
