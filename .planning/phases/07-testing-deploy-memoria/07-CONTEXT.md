# Phase 7: Testing Final, Deploy, Memoria y Defensa - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Cierre final del TFG: validación E2E global y de requisitos no funcionales (NFR-02, NFR-04, NFR-05),
deploy definitivo de staging, completar la memoria del TFG (capítulos 8, 9, 10, 11), y preparar la
defensa (slides + demo grabada).

**Dependency:** Phase 7 ejecuta después de cerrar Phases 08-10 (gap closure). El plan se crea ahora
pero la ejecución queda bloqueada hasta que 08, 09 y 10 estén completas.

Out of scope: NFR-01 (rendimiento) está asignado a Phase 08. NFR-03 (seguridad) ya es Audit Ready.
No se incluye ningún feature nuevo ni refactor no planificado.

</domain>

<decisions>
## Implementation Decisions

### Validación NFRs

- **D-01:** NFR-02 (disponibilidad 99% staging): Desplegar backend en Render, capturar screenshot
  del panel de uptime monitor durante ~1 semana de funcionamiento, documentar resultado en Cap. 10.
  No se requiere infraestructura de monitorización externa — el dashboard de Render es suficiente.

- **D-02:** NFR-04 (usabilidad WCAG 2.1 AA + 3 taps): Spot-check de los 3 flujos principales
  (crear lista, comparar precios, optimizar ruta) con Lighthouse Accessibility en el web companion.
  Documentar score y hallazgos en Cap. 10. No se hace audit WCAG completo.

- **D-03:** NFR-05 (escalabilidad 10k usuarios): Documentación arquitectural justificando que la
  separación en workers Celery independientes (scraping, OCR, optimización) + Redis + PostGIS
  soporta el crecimiento. Sin load test real (requiere infraestructura de pago fuera del alcance TFG).

### Deploy de staging

- **D-04:** Servicios desplegados en Render (free tier) — **ADR-011 opción D**:
  - **Web Service:** Django API (Gunicorn, 3 workers)
  - **PostgreSQL:** Render Database (90 días free)
  - **Redis:** Render Redis (90 días free) — broker Celery + cache Google Places
  - **Background Worker 1:** Celery worker (`celery -A config worker`)
  - **Background Worker 2:** Celery beat (`celery -A config beat`) — scraping programado
  - **Graphhopper NO se despliega.** El optimizer usa **OpenRouteService API** (ORS) como
    proveedor de matriz de distancias. Free tier: 40 req/min, 2.000 req/día — suficiente para
    staging y demo. `apps/optimizer/services.py` adapta el cliente HTTP a la ORS matrix API.
    Variable de entorno: `ORS_API_KEY`. Routing real con calles sin coste de infraestructura.

- **D-05:** Demo móvil iPhone: Compilar `.ipa` via GitHub Actions (runner `macos-latest`) con
  `xcodebuild`. Instalar en iPhone con Sideloadly usando Apple ID gratuito. La firma expira en 7 días
  — re-sideload 1-2 días antes de la defensa para garantizar que el certificado es válido el día D.

- **D-06:** El web companion (Vite+React en `frontend/web/`) NO se despliega a staging. Se usa
  localmente para los tests Playwright y para grabar el vídeo de demo. El backend en Render lo sirve.

### Estrategia E2E

- **D-07:** 4 flujos críticos cubiertos con Playwright automatizado:
  1. Auth completo: registro → login → JWT refresh → logout
  2. Lista → Optimizar → Ruta: crear lista con productos → lanzar optimización → ver ruta
  3. OCR ticket → añadir a lista: subir imagen → Google Vision → productos reconocidos → añadir
  4. Business portal: PYME propone precio → admin aprueba → precio visible al usuario

- **D-08:** Playwright apunta al web companion Vite+React (`frontend/web/`). El backend puede ser
  el staging de Render o Docker local durante las ejecuciones de test.

- **D-09:** Flujos nativos exclusivos de móvil (GPS, cámara física) se cubren con UAT manual
  documentada (checklist + capturas de pantalla) — no son testeables con Playwright.

### Memoria del TFG — contenido

- **D-10:** Capítulos con trabajo real pendiente en `docs/memoria/`:
  - **Cap. 8 (Diseño e implementación):** Actualizar con arquitectura F5/F6 — optimizador,
    OCR backend (Google Vision), portal business, notificaciones push/email.
  - **Cap. 9 (Manual de usuario):** Capturas definitivas desde la app desplegada en Render + iPhone.
  - **Cap. 10 (Pruebas):** Resultados E2E Playwright, NFR validaciones (Render uptime, Lighthouse,
    justificación arquitectural NFR-05).
  - **Cap. 11 (Conclusiones):** Eliminar referencias a F5/F6 como "pendiente". Actualizar
    limitaciones y trabajo futuro al estado real post-cierre.

- **D-13:** Capítulo "Resultados" — la guía ETSII recomienda un capítulo de Resultados separado de
  Conclusiones. Actualmente no existe en `docs/memoria/`. Opciones: añadir Cap. 15-bis entre Pruebas
  y Conclusiones, o integrar resultados cuantitativos al final de Cap. 10. **Decisión: integrar en
  Cap. 10 (Pruebas y resultados)** para no alterar la numeración ya redactada.

### Memoria del TFG — formato y entrega

- **D-14:** La memoria debe entregarse en **PDF** con portada oficial ETSII. El contenido actual está
  en Markdown (`docs/memoria/*.md`). La tarea de Phase 7 incluye convertir a LaTeX usando la
  plantilla oficial en `memoriaTFG/Plantilla TfG/` (clase `pclass.cls`) y generar el PDF final.

- **D-15:** Requisitos de formato obligatorios (guía ETSII v1.2, nov. 2025):
  - Fuente: Arial/Helvetica 11pt, interlineado 1.0 o 1.5
  - Márgenes: 2,5 cm superior/inferior, 3 cm laterales
  - Idioma: español (no se solicita autorización para inglés)
  - Resumen: máximo 1 página, sin figuras ni citas. Abstract en inglés opcional.
  - Numeración: romana para páginas previas (resumen, índices), arábiga para cuerpo

- **D-16:** Entrega formal requiere:
  1. Memoria en PDF con portada oficial
  2. "Declaración de autoría" (documento oficial de la plataforma ETSII)
  3. Presentación (slides) — entrega separada antes de la citación

### Defensa

- **D-17:** Formato oficial de la defensa (Guía TFG ETSII, nov. 2025):
  - Tribunal: 2-3 profesores (el tutor NO puede ser miembro)
  - Calificación: 40% tutor + 60% tribunal (70% memoria + 30% presentación)
  - El tribunal valora: esfuerzo, complejidad del problema, alcance, completitud, competencias,
    calidad de presentación

- **D-18:** Estructura mínima obligatoria de los slides (guía ETSII):
  1. Portada
  2. Motivación
  3. Definición del problema, Objetivos y Requisitos
  4. Solución al problema, Diseño, Arquitectura
  5. Resultados
  6. Conclusiones

- **D-19:** Demo: slides + vídeo grabado (no demo en vivo). Duración estimada 20-30 min + preguntas.
  Vídeo cubre: app iPhone (auth, lista, optimización, ruta), web companion (business portal).

### Claude's Discretion

- Herramienta de grabación para el vídeo de demo.
- Número exacto de diapositivas y balance de tiempo por sección.
- Orden de ejecución de los tests Playwright.

</decisions>

<specifics>
## Specific Ideas

- **iOS sideload sin Mac:** El usuario no tiene Mac en local. La solución elegida es GitHub Actions
  con runner `macos-latest` + `xcodebuild` para generar el `.ipa`, luego Sideloadly en Windows para
  instalarlo. Esto implica crear un workflow `.github/workflows/ios-build.yml`.

- **Demo grabada como principal:** La defensa no usa demo en vivo para evitar riesgos de red/red.
  El vídeo se graba previamente con el sistema en condiciones óptimas.

- **Re-sideload timing:** Planificar re-sideload exactamente 1-2 días antes de la defensa en el
  calendario de tareas — no el mismo día.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos no funcionales (NFR-02, NFR-04, NFR-05)
- `docs/memoria/07-requisitos.md` §RNF-002 (línea ~167) — Disponibilidad 99% staging
- `docs/memoria/07-requisitos.md` §RNF-004 (línea ~171) — Usabilidad WCAG 2.1 AA, 3 taps
- `docs/memoria/07-requisitos.md` §RNF-005 (línea ~173) — Escalabilidad 10k usuarios, Celery workers

### Memoria del TFG (capítulos a actualizar)
- `docs/memoria/10-pruebas.md` — Estado actual de cobertura y estrategia de testing (base para actualización)
- `docs/memoria/11-conclusiones.md` — Contiene referencias a F5/F6 como pendiente — necesita reescritura
- `docs/memoria/08-diseno-implementacion.md` — Base para añadir F5/F6 (optimizador, OCR, business)
- `docs/memoria/09-manual-usuario.md` — Base para capturas definitivas

### Traceability y audit
- `.planning/REQUIREMENTS.md` — Tabla de trazabilidad: NFR-02, NFR-04, NFR-05 en Phase 07
- `.planning/STATE.md` — Estado actual de fases y decisiones clave previas

### Arquitectura y decisiones técnicas
- `CLAUDE.md` — Stack completo, modelo híbrido (ADR-002), comandos de deploy
- `docs/decisiones/002-modelo-hibrido.md` — ADR-002: backend Docker, frontend nativo en host
- `docs/decisiones/007-google-vision-ocr.md` — ADR-007: OCR backend con Google Vision API
- `docs/decisiones/008-gemini-llm.md` — ADR-008: LLM assistant con Gemini API
- `docs/decisiones/011-deploy-staging.md` — ADR-011: deploy staging en Render + ORS API (opción D elegida)

### Deploy
- `docker-compose.yml` + `docker-compose.dev.yml` — Configuración de servicios para referencia Render
- `.github/workflows/ci-backend.yml` — Workflow CI existente (base para el nuevo ios-build.yml)

### Normativa y plantilla TFG (ETSII-US)
- `memoriaTFG/GuíaTFG.pdf` — **LEER COMPLETO.** Guía oficial ETSII nov. 2025 v1.2:
  estructura mínima de memoria, criterios de evaluación (40% tutor + 60% tribunal),
  estructura mínima de presentación, checklist de entrega, proceso de inscripción.
- `memoriaTFG/Plantilla TfG/` — Plantilla LaTeX oficial (clase `pclass.cls`).
  El PDF final debe generarse con esta plantilla o cumplir sus requisitos de formato
  (A4, Arial/Helvetica 11pt, márgenes 2,5/3 cm).
- `memoriaTFG/Plantilla TfG/Capitulos/` — Capítulos de ejemplo LaTeX con estructura
  de secciones, figuras, tablas y referencias bibliográficas.
- `memoriaTFG/Plantilla TfG/resumen.tex` — Formato del resumen obligatorio (≤1 página,
  sin figuras ni citas, obligatorio en español).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/web/src/pages/` — Web companion Vite+React ya existe; es el target de Playwright
- `.planning/phases/06-portal-business-app-movil/06-UAT.md` — UAT manual de Phase 6 existente (modelo para UAT nativa de Phase 7)

### Established Patterns
- Tests Playwright ya configurados en Phase 6 (business portal flows): extender para los 4 flujos de Phase 7
- `make deploy-staging` en Makefile existe como comando de referencia (puede no estar implementado)
- GitHub Actions CI existente en `.github/workflows/` — base para el nuevo workflow iOS build

### Integration Points
- Backend en Render → web companion local apunta a `VITE_API_URL=<render-url>`
- GitHub Actions `macos-latest` runner tiene Xcode preinstalado — no requiere setup adicional

</code_context>

<deferred>
## Deferred Ideas

- **EAS Build:** El usuario prefirió GitHub Actions + Sideloadly. EAS Build queda como alternativa
  si el workflow iOS falla, no como plan principal.
- **Deploy web companion a staging:** No se despliega en Phase 7 — queda para futura referencia
  si se necesita demo pública sin iPhone.
- **Load test con Locust/k6:** Descartado para NFR-05 — documentación arquitectural es suficiente
  para el TFG. Podría retomarse si el tutor lo requiere.
- **WCAG audit completo:** Se hace spot-check de 3 flujos. Un audit full WCAG queda fuera de alcance.

</deferred>

---

*Phase: 07-testing-deploy-memoria*
*Context gathered: 2026-04-08*
