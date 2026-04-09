---
phase: 07-testing-deploy-memoria
plan: "04"
subsystem: documentation-memoria-latex
tags: [memoria, latex, cap08, cap09, cap10, cap11]
requires:
  - phase: 07-02
    provides: resultados-e2e-playwright
provides:
  - actualizacion-capitulos-8-11
  - conversion-latex-cap08-cap11
  - integracion-capitulos-en-proyect-tex
affects: [docs/memoria, memoriaTFG/Plantilla TfG]
tech-stack:
  added: [latex-capitulos-08-11]
  patterns: [sincronizacion-md-latex, trazabilidad-nfr-en-memoria]
key-files:
  created:
    - memoriaTFG/Plantilla TfG/Capitulos/cap08.tex
    - memoriaTFG/Plantilla TfG/Capitulos/cap09.tex
    - memoriaTFG/Plantilla TfG/Capitulos/cap10.tex
    - memoriaTFG/Plantilla TfG/Capitulos/cap11.tex
  modified:
    - docs/memoria/08-diseno-implementacion.md
    - docs/memoria/09-manual-usuario.md
    - docs/memoria/10-pruebas.md
    - docs/memoria/11-conclusiones.md
    - memoriaTFG/Plantilla TfG/proyect.tex
    - docs/diagramas/capturas/README.md
key-decisions:
  - "Se documenta OCR con Google Cloud Vision API y asistente Gemini como estado final de F5/F6."
  - "Capitulo 9 usa referencias de capturas versionadas por nombre estable para sustitucion progresiva."
  - "La memoria LaTeX mantiene la plantilla ETSII y Helvetica en proyect.tex."
patterns-established:
  - "Toda seccion relevante de memoria en Markdown debe tener reflejo en capitulos LaTeX finales."
  - "La validacion de NFR en memoria se respalda con evidencias en Cap. 10 y checklist de cierre."
requirements-completed: [NFR-02, NFR-04, NFR-05]
duration: "retrospective"
completed: 2026-04-09
---

# Phase 7 Plan 04: Memoria y LaTeX Summary

**Capitulos 8-11 de la memoria consolidados en Markdown y LaTeX con estado final del TFG, incluyendo ORS, Vision API, Gemini y portal business.**

## Performance

- **Duration:** Retrospectivo (cierre documental en F7)
- **Started:** 2026-04-09
- **Completed:** 2026-04-09
- **Tasks:** 5
- **Files modified:** 10+

## Accomplishments

- Actualizados los capitulos 08, 10 y 11 con estado final real de F5/F6/F7.
- Capitulo 09 reforzado con referencias de capturas Markdown (`![...](...)`) para flujos web y movil.
- Generados los capitulos LaTeX `cap08.tex` a `cap11.tex` e incluidos en `proyect.tex`.

## Task Commits

Commits historicos asociados al plan:

1. **Task 1-5 (bundle documental):** `ac411c9` (`docs(memoria): actualizar caps 8-11 MD y crear archivos LaTeX (F7-04)`)
2. **Ajuste de cierre en esta ejecucion (sin commit):** referencias de capturas en `09-manual-usuario.md` y alta de `docs/diagramas/capturas/README.md`

## Files Created/Modified

- `.planning/phases/07-testing-deploy-memoria/07-04-SUMMARY.md` - Resumen formal del plan 07-04.
- `docs/memoria/09-manual-usuario.md` - Referencias de capturas y estado OCR/LLM final.
- `docs/diagramas/capturas/README.md` - Convencion de nombres de capturas para memoria.

## Decisions Made

- Se mantuvo la separacion entre evidencias automaticas (tests/E2E) y pendientes manuales (capturas definitivas).
- Se estandarizaron nombres de capturas para evitar roturas de enlaces entre Markdown y LaTeX.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Capitulo 9 sin capturas referenciadas**
- **Found during:** Verificacion previa de 07-04
- **Issue:** `docs/memoria/09-manual-usuario.md` no contenia referencias `![...](...)`.
- **Fix:** Se anadieron 10 referencias de capturas (5 web, 5 movil) y se creo directorio de soporte.
- **Files modified:** `docs/memoria/09-manual-usuario.md`, `docs/diagramas/capturas/README.md`
- **Verification:** 10 matches con patron `!\[` en el capitulo.
- **Committed in:** Pendiente (working tree)

---

**Total deviations:** 1 auto-fix (missing critical)
**Impact on plan:** Correccion necesaria para cumplir criterio de aceptacion del Task 2.

## Issues Encountered

- No se encontraron bloqueos tecnicos. Solo faltaba trazabilidad explicita de capturas en el capitulo 9.

## User Setup Required

- Compilar PDF final: `cd "memoriaTFG/Plantilla TfG" && pdflatex proyect.tex && bibtex proyect && pdflatex proyect.tex && pdflatex proyect.tex`
- Alternativa recomendada: Overleaf (ver `memoriaTFG/BUILD-INSTRUCTIONS.md`).

## Next Phase Readiness

- Memoria estructuralmente lista para cierre.
- Pendiente manual del autor: capturas definitivas y compilacion final del PDF.

## Self-Check: PASSED

- [x] Cap. 8 contiene ORS/Vision API/Gemini/Portal Business.
- [x] Cap. 9 contiene >= 5 referencias de capturas Markdown.
- [x] Cap. 10 contiene Playwright + NFR-02/04/05.
- [x] Cap. 11 no refleja F5/F6 como pendiente.
- [x] `cap08.tex` a `cap11.tex` presentes e incluidos en `proyect.tex`.
