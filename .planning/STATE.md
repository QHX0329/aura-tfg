---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 7 in progress - 07-02 and 07-03 complete
stopped_at: Completed 07-02-PLAN.md (Playwright E2E setup — 4 spec files)
last_updated: "2026-04-09T10:51:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 6
  completed_plans: 4
  percent: 67
---

# Project State

## Current Position

Phase: 07 (testing-deploy-thesis) - IN PROGRESS
Current Plan: 07-02 COMPLETE (also 07-03 COMPLETE)

## Summary

- F1 completada
- F2 completada
- F3 completada
- F4 completada
- F5 completada (9/9 UAT tests passed)
- F6 completada (servicio compartido, tests integracion, UAT aprobada)
- F7 en progreso (07-01 ORS+Render, 07-02 Playwright, 07-03 iOS Build completados)

## Risks

- Integraciones F5 con dependencia externa (scraping estable, OR-Tools, OCR, LLM) pueden afectar calendario.
- Necesidad de cerrar validacion final E2E y rendimiento en F7.
- Certificado Sideloadly caduca en 7 dias — re-sideload 1-2 dias antes de la defensa.

## Immediate Next Steps

1. Ejecutar 07-04 (tests E2E Playwright)
2. Ejecutar 07-05 (memoria TFG capitulos pendientes)
3. Ejecutar 07-06 (cierre: SUMMARY fase, TASKS.md, presentacion)

## Key Decisions

- 04-01: Silent fail for Google Places API proxy - errors return {} to prevent frontend breakage
- 04-01: Redis cache key format places_detail:{pk} with 24h TTL to protect API quota
- 04-01: google_place_id nullable to keep existing stores unaffected
- 04-02: Autocomplete type=establishment (not supermarket) - supermarket is not a valid autocomplete collection type per library docs
- 04-02: DB-match threshold 50m for Places-to-store proximity; discovery markers are ephemeral client state only
- 05-02: legado OCR documentado con pytesseract; ADR-007 aprueba migracion a Google Vision API para F5/F6
- 05-02: 422 for OCRProcessingError (no text extracted), 400 for invalid image, 500 for unexpected errors
- 05-03: claude-haiku-4-5-20251001 for LLM assistant; history truncated to messages[-20:] (10 turns); ScopedRateThrottle at 30/hour; AssistantError wraps all Anthropic SDK exceptions
- 05-04: Mock target for get_distance_matrix is apps.optimizer.services.distance (Python name resolution - mock where defined)
- 05-04: OR-Tools stop_count dimension uses from_node != 0 to count store visits (not depot transitions)
- 05-04: Graphhopper expects [lng, lat] order in matrix API payload (not [lat, lng])
- 06-01: Proposal approval logic extracted to approve_proposal() in services.py; source=CROWDSOURCING canonical for all proposals
- 06-02: Integration tests for proposal admin (6 tests) and bulk prices (5 tests) cover all critical paths
- 07-01: ORS replaces Graphhopper as distance matrix provider; fallback haversine when ORS_API_KEY empty
- 07-01: render.yaml declares 5 services (web+postgres+redis+2 workers); secrets use sync:false (Render Dashboard)
- 07-01: DATABASE_URL postgresql:// converted to postgis:// in base.py before dj_database_url
- 07-03: Descubrimiento dinamico de workspace/scheme con ls + xcodebuild -list para evitar nombres hardcoded tras expo prebuild
- 07-03: method ad-hoc en ExportOptions.plist permite re-firma con Sideloadly y Apple ID gratuito
- 07-03: Re-sideload planificado 1-2 dias antes de la defensa documentado en Makefile y ADR-011
- 07-02: Flujos auth y business son UI-driven (web companion tiene /login, /onboarding, /dashboard); optimizer y OCR son API-level via request fixture (pantallas de lista/cámara son móviles)
- 07-02: Fixture JPEG mínimo (1x1 px) versionado en e2e/fixtures/ para independencia de archivos externos

## Roadmap Evolution

- Phase 6 added: Portal Business y App Movil - Admin UI, CSV prices, EAN-13 validation, UX loading states, business approval notification, RF-019 mobile proposal screen, shared lists verification, email notifications
- Phase 6 complete: service extraction, 11 integration tests, UAT verification, frontend screen validation

## Last Session

- **Stopped at:** Completed 07-02-PLAN.md (Playwright E2E setup — 4 spec files)
- **Date:** 2026-04-09

---
Last updated: 2026-04-09
