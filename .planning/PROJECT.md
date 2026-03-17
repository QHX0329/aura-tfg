# BargAIn

## What This Is

BargAIn es una aplicación móvil y web de compra inteligente para el mercado español que optimiza la cesta de la compra cruzando **precio**, **distancia** y **tiempo** entre múltiples supermercados y comercios locales. El sistema calcula la combinación óptima de paradas que maximiza el ahorro real del usuario mediante un algoritmo de optimización multicriterio con geolocalización PostGIS. Es el Trabajo Fin de Grado de Nicolás Parrilla Geniz en Ingeniería del Software (US), con una planificación de 300h en 20 semanas.

## Core Value

El usuario introduce su lista de la compra y obtiene la ruta óptima entre varios supermercados que minimiza el coste total (precio + desplazamiento), ahorrando >5% respecto a comprar en un solo establecimiento.

## Requirements

### Validated

<!-- F1 y F2 completadas — infraestructura y análisis hechos -->

- ✓ Análisis completo de requisitos (35 RF, 12 RI, 8 RNF, 30 HU, 10 RN) — F1
- ✓ Arquitectura documentada (diagramas de capas, UML, E-R, mockups) — F1
- ✓ Infraestructura Docker + Docker Compose (modelo híbrido backend/frontend) — F2
- ✓ Django 5.x + PostgreSQL 16 + PostGIS 3.4 configurado y funcionando — F2
- ✓ React Native + Expo corriendo nativo en host — F2
- ✓ Celery + Redis configurados para tareas asíncronas — F2
- ✓ CI/CD GitHub Actions (backend + frontend) — F2
- ✓ Linters configurados (Ruff, ESLint, Prettier) — F2
- ✓ Sentry + structlog configurados — F2
- ✓ Datos de prueba seed (fixtures) — F2
- ✓ Dashboard funcional (UI base) — F2

### Active

<!-- F3: Core Backend -->
- [ ] Módulo Users: modelo + roles + JWT auth (RF-001, RF-002, RF-003, RF-005)
- [ ] Módulo Products: catálogo normalizado + búsqueda fuzzy + crowdsourcing (RF-006–RF-010)
- [ ] Módulo Stores: PostGIS + búsqueda geoespacial por radio + Google Places (RF-011–RF-014)
- [ ] Módulo Prices: comparación multi-tienda + histórico + caducidad + alertas (RF-015–RF-019)
- [ ] Módulo Shopping Lists: CRUD + compartir + plantillas (RF-020–RF-023)
- [ ] Portal Business (PYMES): registro + precios + promociones + stats (RF-032–RF-034)
- [ ] Sistema de notificaciones push + email (RF-035)
- [ ] Tests integración y E2E backend (cobertura ≥80%)
- [ ] Documentación API OpenAPI/Swagger

<!-- F4: Frontend -->
- [ ] Navegación (tabs + stack) + tema global + componentes base
- [ ] Pantallas de autenticación + gestión JWT (Axios interceptor)
- [ ] Pantallas de lista de la compra + buscador con autocompletado
- [ ] Comparación de precios + mapa de tiendas cercanas
- [ ] Visualización de ruta optimizada en mapa (polylines + desglose ahorro)
- [ ] Captura OCR (cámara/galería) + revisión de productos reconocidos
- [ ] Interfaz de chat con el asistente LLM + historial
- [ ] Portal Business web (dashboard PYME)

<!-- F5: IA, Optimizador, Scraping -->
- [ ] Spiders Scrapy (Mercadona, Carrefour, Lidl, DIA) + pipeline normalización
- [ ] Algoritmo de optimización multicriterio (Score = w_precio × ahorro - w_dist × dist - w_tiempo × tiempo)
- [ ] Integración OR-Tools + OSRM/Google Directions para distancias reales (RF-024–RF-027)
- [ ] OCR backend (Tesseract) + matching fuzzy contra catálogo (RF-028–RF-029)
- [ ] Integración Claude API con guardrails temáticos (RF-030–RF-031)

<!-- F6: Pruebas y Deploy -->
- [ ] Tests E2E completos (Cypress/Detox)
- [ ] Pruebas de usabilidad con ≥5 usuarios reales
- [ ] Deploy a staging (Render) con CI/CD automatizado
- [ ] Memoria TFG completa (secciones 09–12 pendientes)

### Out of Scope

- Chat en tiempo real entre usuarios — alta complejidad, no aporta al valor core
- Posts de vídeo — coste de almacenamiento, no relevante
- Soporte para mercados fuera de España — alcance del TFG
- App nativa pura (sin Expo) — overhead sin beneficio en prototipo TFG
- Pagos in-app — fuera del alcance del prototipo académico
- Soporte para cadenas que prohíben scraping en robots.txt — RN-009

## Context

- **Tipo:** TFG de Ingeniería del Software, Universidad de Sevilla (ETSII)
- **Estado actual (2026-03-16):** F1 ✅ + F2 ✅ completadas (~85h/300h consumidas, 28%). F3 Core Backend es el siguiente hito.
- **Semana estimada del proyecto:** S5 (de 20)
- **Stack:** Django 5 + DRF + PostGIS (backend) / React Native Expo (frontend nativo en host)
- **Entorno:** Modelo híbrido ADR-002 — backend en Docker, frontend nativo (HMR de Metro se rompe con volúmenes Docker en Windows)
- **Dashboard funcional:** existe una UI base en el frontend, pero sin datos reales conectados
- **Tests:** la infraestructura de tests está configurada (pytest, conftest con fixtures) pero los módulos de negocio aún no tienen tests — la cobertura real es baja
- **Datos mock:** el dashboard usa datos hardcodeados, pendiente de sustituir por API real en F3/F4

## Constraints

- **TFG:** Proyecto académico con fecha de entrega fija — priorizar funcionalidad demostrable sobre perfección
- **Tiempo:** 300h totales (~15h/semana), actualmente en semana S5
- **Stack fijo:** Django + React Native/Expo — decisiones de arquitectura ya tomadas y documentadas (ADR-001, ADR-002)
- **Windows + Docker:** El modelo híbrido es obligatorio por incompatibilidad de HMR con volúmenes Docker en Windows 11
- **PostGIS:** Requiere GDAL/GEOS instalados en el contenedor Docker — ya configurado
- **Cobertura mínima:** ≥80% tests backend (criterio de éxito del TFG)
- **Rendimiento:** API <500ms p95; optimizador <5s con 100 productos, 30 tiendas
- **OCR precision:** ≥75% en listas manuscritas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Django como backend (ADR-001) | Madurez del ecosistema, PostGIS nativo, DRF para API REST | — Pendiente |
| Modelo híbrido backend+frontend (ADR-002) | HMR de Metro/Expo se rompe con volúmenes Docker en Windows | ✓ Funcionando |
| Zustand para estado global (frontend) | Más simple que Redux para el scope del proyecto | — Pendiente |
| OR-Tools para optimización de rutas | Librería probada de Google para TSP/VRP | — Pendiente |
| Claude API para asistente LLM | Calidad del modelo + presupuesto moderado (~15€/mes) | — Pendiente |
| Tesseract OCR en backend | Sin dependencia de servicios cloud costosos | — Pendiente |
| Scrapy + Playwright para scraping | Scrapy para estructura, Playwright para JS-heavy sites | — Pendiente |
| .planning/ en .gitignore | El usuario no quiere commitear documentos de planificación | ✓ Aplicado |

---
*Last updated: 2026-03-16 after initialization (brownfield, F1+F2 completadas)*
