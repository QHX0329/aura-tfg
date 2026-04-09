---
phase: 07-testing-deploy-memoria
plan: "05"
subsystem: defensa-slides-demo
tags: [defensa, marp, slides, demo-script]
requires:
  - phase: 07-04
    provides: memoria-final-actualizada
provides:
  - outline-defensa-etsii
  - script-demo-grabada
  - slides-marp-fuente
affects: [docs/defensa]
tech-stack:
  added: [marp-cli-source, defense-outline]
  patterns: [bloques-etsii, guion-escenas-demo]
key-files:
  created:
    - docs/defensa/slides-outline.md
    - docs/defensa/demo-script.md
    - docs/defensa/slides.md
  modified: []
key-decisions:
  - "Se estructuro la presentacion en 7 bloques ETSII (20 diapositivas aproximadas)."
  - "La demo se normalizo en 5 escenas con timing 3-4 minutos."
  - "Se uso Marp como fuente versionable para generar PDF/HTML."
patterns-established:
  - "Todo material de defensa debe existir como markdown versionado en `docs/defensa/`."
  - "Los pasos de demo incluyen checklist previo y checklist post-grabacion."
requirements-completed: []
duration: "retrospective"
completed: 2026-04-09
---

# Phase 7 Plan 05: Defensa (Slides + Demo) Summary

**Generado un paquete de defensa reproducible con outline ETSII, guion de demo en 5 escenas y fuente Marp para exportar slides en PDF/HTML.**

## Performance

- **Duration:** Retrospectivo (cierre de defensa F7)
- **Started:** 2026-04-09
- **Completed:** 2026-04-09
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- `slides-outline.md` contiene 7 bloques ETSII y cronometraje 20-25 min.
- `demo-script.md` documenta 5 escenas y checklist operativo de grabacion.
- `slides.md` permite salida inmediata via Marp (`--pdf` y `--html`).

## Task Commits

1. **Task 1-3 (bundle defensa):** `db9e770` (`docs(defensa): outline slides, script demo y fuente Marp (F7-05)`)

## Files Created/Modified

- `.planning/phases/07-testing-deploy-memoria/07-05-SUMMARY.md` - Resumen formal del plan 07-05.
- `docs/defensa/slides-outline.md` - Guion completo de presentacion.
- `docs/defensa/demo-script.md` - Escenas de demo grabada.
- `docs/defensa/slides.md` - Fuente Marp para exportacion.

## Decisions Made

- Herramienta de slides elegida: **Marp** (fuente versionada y exportable).
- Fecha objetivo recomendada para ensayo: **1 semana antes de defensa**.
- Recordatorio operativo: **re-sideload IPA 1-2 dias antes** por caducidad de certificado gratuito.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

- Generar PDF de slides: `cd docs/defensa && npx @marp-team/marp-cli slides.md --pdf --output bargain-defensa.pdf`
- Generar HTML de respaldo: `npx @marp-team/marp-cli slides.md --html --output bargain-defensa.html`

## Next Phase Readiness

- Material de defensa listo para ensayo.
- Pendiente manual: grabacion MP4 final y exportacion PDF final de slides.

## Self-Check: PASSED

- [x] `slides-outline.md` contiene 7 bloques (`BLOQUE 1..7`).
- [x] `demo-script.md` contiene 5 escenas.
- [x] `slides.md` contiene `marp: true`.
