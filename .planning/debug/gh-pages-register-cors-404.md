---
status: fixing
trigger: "En la web desplegada en GitHub Pages, al registrarse falla con 404 + bloqueo CORS al endpoint https://bargain-api-8yr0.onrender.com/api/v1/auth/register/."
created: 2026-04-11T11:27:18.8397326+02:00
updated: 2026-04-11T13:02:00.0000000+02:00
---

## Current Focus

hypothesis: Confirmada: la variable runtime CORS_ALLOWED_ORIGINS del servicio web en Render está desalineada (local-only, sin GitHub Pages) respecto a IaC, y el flujo CD actual solo redepliega servicios sin sincronizar env vars.
test: Aplicar actualización directa de env var CORS_ALLOWED_ORIGINS en el servicio web activo y redeploy, luego validar preflight real desde origen GitHub Pages.
expecting: Tras redeploy live, OPTIONS con Origin https://qhx0329.github.io devolverá access-control-allow-origin y el registro dejará de bloquearse por CORS.
next_action: actualizar env var CORS_ALLOWED_ORIGINS en Render (servicio bargain-api-8yr0), forzar deploy web y verificar preflight end-to-end

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

- timestamp: 2026-04-11T12:02:30.0000000+02:00
	checked: checkpoint human-verify en navegador real GitHub Pages
	found: El usuario confirma que el fallo persiste idéntico: preflight CORS sin Access-Control-Allow-Origin para https://qhx0329.github.io en POST /api/v1/auth/register/.
	implication: El cambio en repo no está aplicado en configuración efectiva de producción; investigar despliegue Render y posibles overrides runtime.

- timestamp: 2026-04-11T12:55:40.0000000+02:00
	checked: curl preflight live a https://bargain-api-8yr0.onrender.com/api/v1/auth/register/ con Origin https://qhx0329.github.io
	found: OPTIONS 200 con vary: origin pero sin header access-control-allow-origin.
	implication: Producción sigue denegando explícitamente el origen GitHub Pages.

- timestamp: 2026-04-11T12:55:50.0000000+02:00
	checked: curl preflight live al mismo endpoint con Origin http://localhost:5173 y http://localhost:3000
	found: OPTIONS 200 con access-control-allow-origin devolviendo ambos orígenes locales.
	implication: La allowlist runtime está activa pero restringida a orígenes locales; no coincide con la configuración esperada tras cambios de repo.

- timestamp: 2026-04-11T12:58:10.0000000+02:00
	checked: Render API /v1/services (auth con RENDER_API_KEY en entorno local)
	found: El servicio web activo es bargain-api (id srv-d7c0kcf7f7vs73c44bog, slug bargain-api-8yr0, url https://bargain-api-8yr0.onrender.com).
	implication: Se identifica de forma inequívoca el servicio de producción a corregir.

- timestamp: 2026-04-11T12:59:40.0000000+02:00
	checked: Render API GET /v1/services/srv-d7c0kcf7f7vs73c44bog/env-vars/CORS_ALLOWED_ORIGINS
	found: Valor runtime actual = http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,exp://localhost:8081 (sin https://qhx0329.github.io).
	implication: Causa raíz confirmada en configuración efectiva de producción.

- timestamp: 2026-04-11T13:00:35.0000000+02:00
	checked: render.yaml + workflow .github/workflows/cd-render-staging.yml
	found: render.yaml declara CORS_ALLOWED_ORIGINS incluyendo GitHub Pages, pero el workflow CD dispara deploys por service ID y no sincroniza env vars desde IaC.
	implication: Existe drift IaC-vs-runtime; editar repo/render.yaml no corrige por sí solo la variable efectiva en el servicio ya creado.

## Resolution

root_cause: Drift de configuración en Render: la variable runtime CORS_ALLOWED_ORIGINS del servicio web activo (bargain-api-8yr0) quedó en una allowlist local-only sin https://qhx0329.github.io; además, el CD actual redepliega pero no sincroniza env vars desde render.yaml.
fix: En curso: actualización directa de CORS_ALLOWED_ORIGINS en Render + redeploy del web service para aplicar la configuración efectiva correcta.
verification: Pendiente de prueba preflight live tras deploy.
files_changed: []
