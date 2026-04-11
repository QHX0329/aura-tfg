---
status: awaiting_human_verify
trigger: "En el despliegue de la app web en GitHub Pages, las peticiones API siguen apuntando a localhost en vez de la URL desplegada de Render."
created: 2026-04-11T11:05:51.7155410+02:00
updated: 2026-04-11T11:09:42.3199602+02:00
---

## Current Focus

hypothesis: el frontend web resuelve API_BASE_URL a localhost porque VITE_API_URL no se define en GitHub Pages y existe fallback hardcodeado local
test: desplegar workflow de GitHub Pages y verificar en navegador remoto que las llamadas salen a Render
expecting: requests a https://bargain-api-8yr0.onrender.com/api/v1/* sin intentos a localhost
next_action: checkpoint human-verify para validar comportamiento en entorno real GitHub Pages
known_pattern_candidate: mobile-api-render-connectivity - Mobile app used localhost or LAN base URL instead of Render public API

## Symptoms

expected: La app web desplegada en GitHub Pages debe enviar peticiones al backend público desplegado en Render.
actual: La app web en producción intenta consumir endpoints en localhost.
errors: Fallos de red/CORS por intentar contactar localhost desde un navegador remoto (detalle exacto no aportado).
reproduction: Abrir la web desplegada en GitHub Pages y ejecutar cualquier acción que haga llamadas API (login, fetch de datos, etc.).
started: El problema se observa en despliegue web actual; no se especifica desde cuándo.

## Eliminated

## Evidence

- timestamp: 2026-04-11T11:06:04.6325664+02:00
	checked: .planning/debug/knowledge-base.md
	found: Knowledge base match on [localhost, render, api url, fallback] -> Root cause anterior fue fallback local cuando faltaba variable de entorno pública.
	implication: probar primero configuración de variables de entorno públicas y fallback en cliente API web.

- timestamp: 2026-04-11T11:06:29.7221808+02:00
	checked: frontend/web/src/api/client.ts
	found: API_BASE_URL usa import.meta.env.VITE_API_URL y, si está ausente, cae a http://localhost:8000/api/v1.
	implication: si el workflow no inyecta VITE_API_URL, producción queda apuntando a localhost.

- timestamp: 2026-04-11T11:06:29.7221808+02:00
	checked: .github/workflows/deploy-web-gh-pages.yml
	found: el job build define VITE_BASE_PATH y VITE_DEMO_VIDEO_URL pero no define VITE_API_URL.
	implication: build de GitHub Pages probablemente usa fallback localhost del cliente web.

- timestamp: 2026-04-11T11:07:58.6774147+02:00
	checked: build local de frontend/web + inspeccion dist/assets/*.js
	found: el bundle de produccion contiene la cadena localhost:8000/api/v1.
	implication: la URL localhost queda embebida en compilacion y confirma la causa reportada en GitHub Pages.

- timestamp: 2026-04-11T11:08:19.7812280+02:00
	checked: frontend/web/src/api/client.ts y .github/workflows/deploy-web-gh-pages.yml
	found: se aplico fallback por defecto a Render en cliente web y se inyecto VITE_API_URL en workflow de Pages.
	implication: el build publico deja de depender de fallback localhost y queda configurado explicitamente hacia Render.

- timestamp: 2026-04-11T11:09:42.3199602+02:00
	checked: npm run build en frontend/web + inspeccion de dist/assets/*.js
	found: LOCALHOST_HITS=0 y RENDER_HITS=1 en bundle de produccion.
	implication: el artefacto compilado ya no referencia localhost y apunta a Render.

- timestamp: 2026-04-11T11:09:42.3199602+02:00
	checked: npx eslint src/api/client.ts (frontend/web)
	found: sin errores de lint en el archivo modificado.
	implication: el cambio mantiene calidad de codigo en el area afectada.

## Resolution

root_cause: el cliente web usa fallback a http://localhost:8000/api/v1 cuando falta VITE_API_URL, y el workflow de GitHub Pages no inyecta esa variable durante el build.
fix: reemplazado fallback localhost por URL publica de Render en frontend/web/src/api/client.ts y anadida VITE_API_URL en .github/workflows/deploy-web-gh-pages.yml.
verification: build web local exitoso con bundle sin localhost (0 hits) y con Render (1 hit), mas lint dirigido OK en frontend/web/src/api/client.ts.
files_changed: [frontend/web/src/api/client.ts, .github/workflows/deploy-web-gh-pages.yml]
