---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 7 in progress - 07-01 complete
stopped_at: Completed 07-01-PLAN.md (ORS + render.yaml)
last_updated: "2026-04-09T10:50:22.276Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 6
  completed_plans: 3
  percent: 50
---

# Project State

## Current Position

Phase: 07 (testing-deploy-thesis) - IN PROGRESS
Current Plan: 07-01 COMPLETE

## Summary

- F1 completada
- F2 completada
- F3 completada
- F4 completada
- F5 completada (9/9 UAT tests passed)
- F6 completada (servicio compartido, tests integracion, UAT aprobada)
- F7 pendiente (testing final, deploy staging, memoria TFG)

## Risks

- Integraciones F5 con dependencia externa (scraping estable, OR-Tools, OCR, LLM) pueden afectar calendario.
- Necesidad de cerrar validacion final E2E y rendimiento en F7.

## Immediate Next Steps

1. Plan and execute Phase 7 (testing final, deploy, thesis)
2. Run full E2E test suite
3. Close thesis documentation

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

## Roadmap Evolution

- Phase 6 added: Portal Business y App Movil - Admin UI, CSV prices, EAN-13 validation, UX loading states, business approval notification, RF-019 mobile proposal screen, shared lists verification, email notifications
- Phase 6 complete: service extraction, 11 integration tests, UAT verification, frontend screen validation

## Last Session

- **Stopped at:** Completed 07-01-PLAN.md (ORS + render.yaml)
- **Date:** 2026-04-09

---
Last updated: 2026-04-09
