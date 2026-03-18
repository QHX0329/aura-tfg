---
status: resolved
trigger: "La pantalla del frontend al iniciar se me queda en blanco, me pone este error en consola: Uncaught TypeError: (0 , _reactNativeWebDistIndex.codegenNativeComponent) is not a function"
created: 2026-03-18T00:00:00Z
updated: 2026-03-18T12:43:00Z
---

## Current Focus

hypothesis: Confirmado. Alertas de precio tenían mismatch de shape y HomeScreen recibía no-array en estado.
test: Normalizar `priceService.getPriceAlerts()` y usar `safePriceAlerts` en render.
expecting: Se elimina `priceAlerts.slice is not a function`.
next_action: validación manual del usuario en navegador

## Symptoms

expected: La app web de Expo debe renderizar la pantalla inicial sin errores JS bloqueantes.
actual: Pantalla en blanco al iniciar frontend en web.
errors: Uncaught TypeError: (0 , _reactNativeWebDistIndex.codegenNativeComponent) is not a function.
reproduction: Ejecutar frontend en web (npx expo start --web) y cargar AppEntry bundle.
started: Reportado el 2026-03-18; inicio exacto pendiente de confirmar.

## Eliminated

## Evidence

- timestamp: 2026-03-18T10:23:00Z
	checked: frontend/package.json
	found: Expo 55.0.6 con react-native 0.83.2, react-native-web 0.21.0 y react-native-maps 1.27.2.
	implication: Existe riesgo de incompatibilidad web por libreria nativa evaluada durante carga inicial.

- timestamp: 2026-03-18T10:24:00Z
	checked: busqueda en frontend/src de importaciones de mapas
	found: MapScreen.tsx importa MapView/Marker de react-native-maps.
	implication: Si esa pantalla se incluye en el arbol inicial, puede romper el bundle web.

- timestamp: 2026-03-18T10:25:00Z
	checked: busqueda global de codegenNativeComponent en node_modules
	found: La busqueda global timeout; no se ha aislado aun el archivo exacto.
	implication: Conviene confirmar por ruta de importacion del arbol de navegacion.

- timestamp: 2026-03-18T10:29:00Z
	checked: frontend/src/navigation/MainTabs.tsx y frontend/src/screens/map/MapScreen.tsx
	found: MainTabs importa MapScreen en top-level y MapScreen importa react-native-maps en top-level.
	implication: El bundle web evalua la cadena de imports durante arranque y puede disparar error antes de render.

- timestamp: 2026-03-18T10:31:00Z
	checked: frontend/node_modules/react-native-maps/src/specs/*
	found: Multiples archivos importan codegenNativeComponent desde react-native (ej. NativeComponentMapView.ts).
	implication: En web, react-native-web no provee esa funcion y la evaluacion revienta con el TypeError reportado.

- timestamp: 2026-03-18T10:38:00Z
	checked: frontend/src/navigation/MainTabs.tsx + nueva variante frontend/src/screens/map/MapScreen.web.tsx
	found: El tab de mapa mantiene import estatico, pero en web se resuelve a la variante .web sin depender de react-native-maps.
	implication: Se corta la ruta que evaluaba codigo nativo incompatible al arrancar web.

- timestamp: 2026-03-18T10:39:00Z
	checked: eslint sobre archivos modificados
	found: Sin errores ni warnings tras migrar a variante de plataforma.
	implication: Cambio consistente con reglas de calidad frontend.

- timestamp: 2026-03-18T10:41:00Z
	checked: expo start --web (puerto 19007)
	found: "Web Bundled ... node_modules/expo/AppEntry.js" completado sin stacktrace de codegenNativeComponent.
	implication: La app web ya compila y arranca en desarrollo sin el fallo bloqueante reportado.

- timestamp: 2026-03-18T10:50:00Z
	checked: reporte de usuario posterior al fix de mapa
	found: Nuevo error en consola: `ExpoSecureStore.default.getValueWithKeyAsync is not a function` durante `authStore.hydrate()`.
	implication: El bloqueo actual ya no es mapa; ahora la causa esta en persistencia de sesion en web.

- timestamp: 2026-03-18T10:54:00Z
	checked: frontend/src/store/authStore.ts
	found: `hydrate`, `login` y `logout` llaman directamente a SecureStore.get/set/delete.
	implication: El error reportado encaja con fallo en `getItemAsync` durante hidratacion.

- timestamp: 2026-03-18T10:55:00Z
	checked: frontend/src/api/client.ts
	found: El interceptor de refresh tambien usa SecureStore.get/set directamente.
	implication: Aunque se arregle hydrate, seguirian posibles errores web en refresh token si no se centraliza storage.

- timestamp: 2026-03-18T10:56:00Z
	checked: frontend/src/utils
	found: Solo existe `.gitkeep`; no hay wrapper de almacenamiento.
	implication: Se puede introducir utility de plataforma sin romper patrones existentes.

- timestamp: 2026-03-18T11:00:00Z
	checked: refactor en authStore y apiClient
	found: Se reemplazaron llamadas directas a SecureStore por `@/utils/secureStorage`.
	implication: `hydrate` y refresh token ya no dependen directamente del modulo problemático en web.

- timestamp: 2026-03-18T11:01:00Z
	checked: frontend/src/utils/secureStorage.ts
	found: En web usa localStorage/memoria; en nativo hace import dinamico de expo-secure-store.
	implication: Se evita ejecutar APIs internas de SecureStore en plataforma web.

- timestamp: 2026-03-18T11:02:00Z
	checked: eslint en archivos modificados
	found: Sin errores tras consolidar el modulo de storage.
	implication: Fix estable a nivel estático.

- timestamp: 2026-03-18T11:03:00Z
	checked: expo start --web (puerto 19008)
	found: Metro bundle web completado sin errores de runtime en salida del servidor.
	implication: La app web arranca con el fix aplicado; falta validacion final en consola del navegador del usuario.

- timestamp: 2026-03-18T11:17:00Z
	checked: nuevo reporte del usuario durante login
	found: Respuesta 400 con `details.username: ["Este campo es requerido."]`.
	implication: El contrato de request de login del frontend no coincide con el backend.

- timestamp: 2026-03-18T11:20:00Z
	checked: frontend/src/api/authService.ts
	found: `authService.login` enviaba `{ email, password }` a `/auth/token/`.
	implication: Causa directa del error 400 del backend.

- timestamp: 2026-03-18T11:22:00Z
	checked: frontend/src/screens/auth/LoginScreen.tsx
	found: El formulario y la llamada login estaban acoplados a `email`.
	implication: La UI guiaba al dato incorrecto para el contrato del endpoint.

- timestamp: 2026-03-18T11:23:00Z
	checked: frontend/src/screens/auth/RegisterScreen.tsx
	found: Tras registrar, se hacia un segundo login con email.
	implication: Riesgo de fallo post-registro si backend exige username; se reemplazo por uso de tokens devueltos en register.

- timestamp: 2026-03-18T11:35:00Z
	checked: nuevo reporte del usuario tras cambio a username
	found: Respuesta 401 `NO_ACTIVE_ACCOUNT` al login con usuarios seed_consumer_1/2.
	implication: El payload ya pasa validacion de campos, pero las credenciales no autentican en backend.

- timestamp: 2026-03-18T11:38:00Z
	checked: backend/apps/core/management/commands/seed_data.py
	found: `DEFAULT_SEED_PASSWORD = "seedpass123"` y el comando reasigna esa password a usuarios seed.
	implication: La contraseña correcta de seeds no depende de estado activo, sino del valor fijo `seedpass123` tras seed.

- timestamp: 2026-03-18T11:40:00Z
	checked: consulta directa en backend (Django shell en contenedor)
	found: `seed_consumer_1` y `seed_consumer_2` existen, `is_active=True` y `check_password('seedpass123')=True`.
	implication: Los usuarios están activos y con credenciales válidas en servidor.

- timestamp: 2026-03-18T11:41:00Z
	checked: POST real a `http://localhost:8000/api/v1/auth/token/`
	found: `{"username":"seed_consumer_1","password":"seedpass123"}` devuelve 200 con access/refresh.
	implication: API backend funciona; el 401 del cliente apunta a password introducida distinta, valor cacheado o bundle viejo.

- timestamp: 2026-03-18T11:48:00Z
	checked: payload real enviado desde frontend (aportado por usuario)
	found: `{"username":"seed_consumer_1","password":"seedpass1"}`.
	implication: Password incompleta/incorrecta; explica totalmente `NO_ACTIVE_ACCOUNT`.

- timestamp: 2026-03-18T11:59:00Z
	checked: nuevo reporte del usuario tras login con token captado
	found: `/api/v1/auth/profile/me/` devuelve `NOT_AUTHENTICATED` por ausencia de credenciales.
	implication: El token existe, pero no se adjunta en esa request concreta del flujo de login.

- timestamp: 2026-03-18T12:04:00Z
	checked: frontend/src/screens/auth/LoginScreen.tsx y RegisterScreen.tsx
	found: Ambas pantallas hacian `getProfile()` antes de guardar token en authStore; el interceptor no podia añadir Authorization.
	implication: Causa directa del 401 en profile inmediatamente despues de login/register.

- timestamp: 2026-03-18T12:05:00Z
	checked: frontend/src/api/authService.ts
	found: Se añadió `getProfileWithToken(accessToken)` que envía `Authorization: Bearer <token>` explícito.
	implication: El bootstrap de sesión ya no depende del estado previo del store.

- timestamp: 2026-03-18T12:06:00Z
	checked: flujo auth actualizado
	found: LoginScreen y RegisterScreen usan `getProfileWithToken(tokens.access)`.
	implication: Debe resolverse `NOT_AUTHENTICATED` en primera carga de perfil tras login.

- timestamp: 2026-03-18T12:15:00Z
	checked: nuevo reporte del usuario tras login
	found: Pantalla en blanco con `TypeError: lists is not iterable` en `HomeScreen`.
	implication: Hay una asunción de tipo no validada en HomeScreen durante render/transformación de listas.

- timestamp: 2026-03-18T12:18:00Z
	checked: backend/config/settings/base.py + backend/apps/shopping_lists/views.py
	found: DRF global pagination activa y ShoppingListViewSet no desactiva paginación.
	implication: Endpoint `/lists/` retorna objeto paginado, no array directo.

- timestamp: 2026-03-18T12:19:00Z
	checked: frontend/src/screens/home/HomeScreen.tsx
	found: `recentLists` usa `const recentLists = [...lists]`, lo que exige iterable.
	implication: Si `lists` recibe objeto paginado, explota con `lists is not iterable`.

- timestamp: 2026-03-18T12:20:00Z
	checked: frontend/src/api/listService.ts
	found: `getLists()` asumía `ShoppingList[]` sin normalizar payload paginado.
	implication: Causa directa de contaminar store con tipo incorrecto en runtime.

- timestamp: 2026-03-18T12:21:00Z
	checked: fix aplicado en servicio/store
	found: `getLists()` normaliza `payload.results` y `setLists` fuerza array defensivo.
	implication: HomeScreen queda protegido frente a respuestas no iterables.

- timestamp: 2026-03-18T12:28:00Z
	checked: nuevo reporte del usuario
	found: `TypeError: priceAlerts.slice is not a function` en HomeScreen.
	implication: Persisten shape mismatches en otros widgets del dashboard (alertas).

- timestamp: 2026-03-18T12:31:00Z
	checked: frontend/src/api/priceService.ts
	found: `getPriceAlerts()` asumía array directo, sin considerar paginación.
	implication: El estado de HomeScreen podía recibir objeto no-array.

- timestamp: 2026-03-18T12:33:00Z
	checked: frontend/src/screens/home/HomeScreen.tsx
	found: Render usaba `priceAlerts.slice(...)` y `priceAlerts.length` sin guardas.
	implication: Cualquier payload no-array provocaba crash inmediato en dashboard.

- timestamp: 2026-03-18T12:34:00Z
	checked: fix aplicado
	found: `priceService` normaliza array/paginado y HomeScreen usa `safePriceAlerts`.
	implication: Se previene el crash incluso ante datos inesperados.

## Resolution

root_cause: `priceService.getPriceAlerts()` no normalizaba respuesta paginada de DRF y HomeScreen llamaba `.slice` sobre valor no-array.
fix: Normalización en `priceService.getPriceAlerts()` + guard defensivo `safePriceAlerts` en HomeScreen.
verification: Lint ejecutado en archivos modificados; pendiente confirmación runtime por usuario.
files_changed: ["frontend/src/navigation/MainTabs.tsx", "frontend/src/screens/map/MapScreen.web.tsx", "frontend/src/store/authStore.ts", "frontend/src/api/client.ts", "frontend/src/utils/secureStorage.ts", "frontend/src/api/authService.ts", "frontend/src/screens/auth/LoginScreen.tsx", "frontend/src/screens/auth/RegisterScreen.tsx"]
