---
status: awaiting_human_verify
trigger: "En la web desplegada en GitHub Pages, al registrarse falla con 404 + bloqueo CORS al endpoint https://bargain-api-8yr0.onrender.com/api/v1/auth/register/."
created: 2026-04-11T11:27:18.8397326+02:00
updated: 2026-04-11T11:31:55.0000000+02:00
---

## Current Focus

hypothesis: Causa raíz confirmada: CORS_ALLOWED_ORIGINS en producción no incluye el origen GitHub Pages (https://qhx0329.github.io), por eso el preflight OPTIONS no devuelve Access-Control-Allow-Origin para ese origen.
test: Validación local completada de integridad de configuración; pendiente validación end-to-end tras deploy Render.
expecting: Tras desplegar backend, preflight OPTIONS desde https://qhx0329.github.io incluirá Access-Control-Allow-Origin y el registro dejará de fallar por CORS.
next_action: checkpoint human-verify en entorno real GitHub Pages + Render

## Symptoms

expected: El registro desde https://qhx0329.github.io debe responder correctamente desde backend Render y permitir preflight CORS.
actual: En navegador aparece 404 y luego CORS preflight bloqueado: No Access-Control-Allow-Origin.
errors: Failed to load resource: server responded with 404; blocked by CORS policy; POST .../auth/register/ net::ERR_FAILED.
reproduction: Abrir la web en GitHub Pages, ir a registro y enviar formulario.
started: Aparece actualmente tras ajuste de VITE_API_URL para apuntar a Render.

## Eliminated

- hypothesis: El endpoint de registro no existe en backend Render y por eso devuelve 404.
	evidence: /api/v1/auth/register/ responde OPTIONS 200, POST 400 y GET 405, lo que confirma ruta activa con métodos controlados.
	timestamp: 2026-04-11T11:30:10.0000000+02:00

## Evidence

- timestamp: 2026-04-11T11:28:35.0000000+02:00
	checked: .planning/debug/knowledge-base.md
	found: No hay entrada con solapamiento fuerte (2+ keywords específicas como auth/register, CORS preflight, GitHub Pages 404).
	implication: No existe patrón resuelto idéntico; continuar con investigación de rutas y configuración real.

- timestamp: 2026-04-11T11:29:00.0000000+02:00
	checked: frontend/web/src/api/client.ts, frontend/web/src/pages/RegisterPage.tsx, backend/config/urls.py, backend/apps/users/urls.py, .github/workflows/deploy-web-gh-pages.yml
	found: Frontend web llama /auth/register/ sobre base URL https://bargain-api-8yr0.onrender.com/api/v1 y backend expone api/v1/auth/register/.
	implication: No se observa desalineación de endpoint entre cliente web y rutas Django.

- timestamp: 2026-04-11T11:29:10.0000000+02:00
	checked: curl OPTIONS/POST/GET contra https://bargain-api-8yr0.onrender.com/api/v1/auth/register/
	found: OPTIONS=200, POST=400, GET=405.
	implication: Ruta de registro existe y está operativa; el fallo principal no es routing 404 del endpoint objetivo.

- timestamp: 2026-04-11T11:29:25.0000000+02:00
	checked: Preflight OPTIONS con Origin https://qhx0329.github.io y con orígenes locales
	found: Para GitHub Pages no se devuelve Access-Control-Allow-Origin; para http://localhost:5173, http://localhost:3000 y http://127.0.0.1:5173 sí.
	implication: Lista CORS efectiva actual permite orígenes locales pero excluye GitHub Pages.

- timestamp: 2026-04-11T11:29:35.0000000+02:00
	checked: backend/config/settings/base.py _default_cors_origins
	found: La lista por defecto contiene localhost/127/exp pero no https://qhx0329.github.io.
	implication: Si Render no define CORS_ALLOWED_ORIGINS explícito, producción hereda una allowlist sin GitHub Pages y bloquea preflight.

- timestamp: 2026-04-11T11:30:55.0000000+02:00
	checked: backend/config/settings/base.py y render.yaml
	found: Añadido https://qhx0329.github.io a _default_cors_origins y declarada variable CORS_ALLOWED_ORIGINS en render.yaml con ese origen incluido.
	implication: El backend queda configurado para aceptar preflight desde GitHub Pages una vez desplegado.

- timestamp: 2026-04-11T11:31:20.0000000+02:00
	checked: pytest tests/unit/test_render_yaml.py -v (entorno local)
	found: No ejecutable localmente por dependencia GIS (GDAL faltante) durante bootstrap de Django en pytest-django.
	implication: Se usan validaciones estáticas dirigidas y verificación en entorno desplegado para confirmar fix funcional.

- timestamp: 2026-04-11T11:31:45.0000000+02:00
	checked: python yaml.safe_load(render.yaml) + inspección de key CORS_ALLOWED_ORIGINS y búsqueda de origen en config/settings/base.py
	found: render.yaml parsea correctamente y expone CORS_ALLOWED_ORIGINS incluyendo https://qhx0329.github.io; base.py incluye ese origen en defaults.
	implication: El cambio está consistente en código e IaC; solo falta despliegue para validar efecto runtime.

## Resolution

root_cause: La allowlist CORS efectiva del backend en Render solo permitía orígenes locales (localhost/127/exp) y excluía https://qhx0329.github.io, provocando preflight sin Access-Control-Allow-Origin para registro web.
fix: Añadido el origen https://qhx0329.github.io a la allowlist CORS por defecto del backend y explicitado CORS_ALLOWED_ORIGINS en render.yaml para despliegues Render.
verification: Validación estática OK (render.yaml válido + origen presente en configuración). Validación funcional end-to-end pendiente de deploy y prueba manual desde GitHub Pages.
files_changed: [backend/config/settings/base.py, render.yaml]
