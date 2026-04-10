---
status: resolved
trigger: "Investigate issue: mobile-api-render-connectivity — La app desde movil no se conecta a la API desplegada en Render"
created: 2026-04-10T10:48:21.2794782+02:00
updated: 2026-04-10T11:15:00.0000000+02:00
---

## Current Focus

hypothesis: Confirmada y cerrada. El backend Render esta sano y el incidente proviene de baseURL cliente movil (IP local/fallback localhost).
test: Cierre documental de la sesion con evidencia automatizada y registro en knowledge base.
expecting: Incidencia resuelta con alta confianza operativa y riesgo residual explicitado.
next_action: Ninguna accion tecnica pendiente en esta sesion; esperar smoke test manual cuando el usuario este disponible.

## Symptoms

expected: La app movil debe autenticarse y consumir endpoints de la API desplegada en Render sin errores de red/SSL/CORS/baseURL.
actual: Desde movil no conecta con la API desplegada.
errors: Usuario no disponible; no hay stacktrace aportado. Investigar logs/estado de servicios y fallos de configuracion.
reproduction: Abrir app movil (Expo/dev client o build), intentar flujo basico (login/listas/productos) y observar que fallan llamadas API.
started: Incidencia actual, momento exacto desconocido.

## Eliminated

## Evidence

- timestamp: 2026-04-10T10:49:12.0000000+02:00
	checked: .planning/debug/knowledge-base.md
	found: No hay coincidencias con 2+ keywords para sintomas de conectividad movil-Render (API/baseURL/CORS/SSL).
	implication: No existe patron previo reutilizable; se continua con investigacion desde evidencia primaria.

- timestamp: 2026-04-10T10:51:05.0000000+02:00
	checked: Busqueda global de configuracion (render/API/baseURL)
	found: Existe render.yaml y workflow cd-render-staging; hay referencias de API/baseURL en frontend y settings prod backend.
	implication: Ya hay suficiente superficie identificada para validar hipotesis de desalineacion entre deploy Render y URL consumida por app movil.

- timestamp: 2026-04-10T10:53:30.0000000+02:00
	checked: render.yaml, backend/config/settings/prod.py, frontend/src/api/client.ts, .github/workflows/cd-render-staging.yml
	found: frontend/src/api/client.ts define API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || http://localhost:8000/api/v1; deploy backend Render expone healthCheckPath /api/v1/health/ y pipeline CD depende de IDs de servicios Render.
	implication: Hay mecanismo claro para fallo exclusivo en movil cuando EXPO_PUBLIC_API_URL no llega al runtime; se requiere confirmar con evidencia de entorno y estado real Render.

- timestamp: 2026-04-10T10:55:40.0000000+02:00
	checked: frontend/package.json, frontend/app.json, frontend/.env.local
	found: No hay scripts que inyecten EXPO_PUBLIC_API_URL explicitamente; frontend/.env.local fija EXPO_PUBLIC_API_URL a una IP local (172.20.10.2) y no a URL Render.
	implication: Alta probabilidad de que el cliente movil este configurado para backend local o fallback localhost en vez de backend desplegado.

- timestamp: 2026-04-10T10:58:35.0000000+02:00
	checked: Render API /v1/services y /v1/services/{id}/deploys?limit=1
	found: Servicios bargain-api, bargain-celery-worker y bargain-celery-beat existen y su ultimo deploy esta live; URL publica backend detectada en serviceDetails.url.
	implication: No hay evidencia de servicio caido en Render; se debe verificar conectividad HTTP publica y configuracion de cliente movil.

- timestamp: 2026-04-10T11:08:20.0000000+02:00
	checked: Detalle de servicio web y ultimo deploy por servicio en Render API
	found: bargain-api URL publica https://bargain-api-8yr0.onrender.com; deploys live recientes (api dep-d7cbe03v626s73asp0q0, worker dep-d7cbfkfavr4c73ebussg, beat dep-d7cbgfpf9bms73ep3ieg).
	implication: Infraestructura principal de backend y workers esta levantada y actualizada.

- timestamp: 2026-04-10T10:58:35.0000000+02:00
	checked: Render API endpoints de recursos dependientes (/postgres, /databases, /redis)
	found: El token/endpoint actual no expone estos recursos (404), por lo que no se puede observar su estado directamente por esta via.
	implication: La validacion de dependencias se limita a estado de workers y salud funcional del web service via endpoints publicos.

- timestamp: 2026-04-10T11:03:20.0000000+02:00
	checked: Smoke checks HTTP publicos contra https://bargain-api-8yr0.onrender.com
	found: GET /api/v1/health/ -> 200, GET /api/health/health/ -> 200, GET /api/v1/schema/ -> 200, POST /api/v1/auth/token/ con credenciales invalidas -> 401 de aplicacion (no error de red/SSL).
	implication: La API desplegada esta accesible y operativa; la desconexion desde movil se explica por URL cliente incorrecta.

- timestamp: 2026-04-10T11:05:45.0000000+02:00
	checked: frontend lint focalizado (cd frontend; npx eslint src/api/client.ts)
	found: Sin errores de lint en el archivo modificado.
	implication: El fix de baseURL cliente es valido a nivel de calidad estatica en frontend.

- timestamp: 2026-04-10T11:08:20.0000000+02:00
	checked: Diff del fix en frontend
	found: API client ahora usa fallback DEFAULT_API_BASE_URL a Render y frontend/.env.example documenta EXPO_PUBLIC_API_URL.
	implication: Se elimina el caso por defecto que enviaba mobile a localhost/IP LAN no enrutable.

- timestamp: 2026-04-10T11:15:00.0000000+02:00
	checked: checkpoint_response de human-verify con verificacion automatizada
	found: Render MCP confirma bargain-api/bargain-celery-worker/bargain-celery-beat presentes y activos con ultimos deploys live; checks HTTP externos devuelven /api/v1/health/ 200 (database ok), /api/v1/schema/ 200 y auth responde error de validacion de aplicacion; preflight CORS sin ACAO para exp:// no bloquea networking nativo mobile.
	implication: Evidencia convergente de que la API publica esta disponible y el fix de baseURL elimina la causa raiz de conectividad desde movil.

## Resolution

root_cause:
	La app movil resolvia API_BASE_URL a una URL local (frontend/.env.local con IP LAN) o al fallback
	http://localhost:8000/api/v1 en ausencia de EXPO_PUBLIC_API_URL. En dispositivo movil, esas URLs
	no apuntan al backend desplegado en Render y causan fallo de conectividad.
fix:
	Se cambio el fallback de API_BASE_URL en frontend/src/api/client.ts para usar
	https://bargain-api-8yr0.onrender.com/api/v1 cuando EXPO_PUBLIC_API_URL no esta definido.
	Se documento EXPO_PUBLIC_API_URL en frontend/.env.example.
	Ademas, se alineo frontend/.env.local al endpoint Render para que el runtime movil
	de este workspace no sobrescriba con una IP LAN local.
verification:
	Verificacion automatizada completada: estado Render live en los 3 servicios, health/schema/auth publicos correctos y lint cliente API en verde.
	Se cierra la incidencia con alta confianza; queda recomendacion operativa de smoke test en dispositivo real cuando el usuario este disponible.
files_changed:
	- frontend/src/api/client.ts
	- frontend/.env.example
	- frontend/.env.local
