# Wireframes / Mockups de UI — BargAIn

> **Tarea:** F1-14 — Wireframes / Mockups de UI
> **Estado:** ✅ Completado
> **Fecha:** 2026-03-10
> **Entregable:** `docs/diagramas/ui-mockups/`

---

## Descripción

Este directorio contiene los wireframes de baja-media fidelidad de la aplicación BargAIn,
representados en formato ASCII art + Markdown. Cubren las pantallas principales del usuario
**Consumidor** (app móvil React Native / Expo) y el portal web del **Comercio / PYME**.

Los wireframes están organizados en 8 archivos temáticos que siguen el flujo natural
del usuario a través de la aplicación.

---

## Índice de pantallas

| Archivo | Pantallas incluidas |
|---------|---------------------|
| [01-onboarding-auth.md](01-onboarding-auth.md) | Splash, Bienvenida, Login, Registro, Recuperar contraseña |
| [02-home-listas.md](02-home-listas.md) | Home / Dashboard, Lista de listas, Detalle de lista, Añadir ítem |
| [03-productos-busqueda.md](03-productos-busqueda.md) | Buscador con autocompletado, Resultados, Detalle de producto, Comparativa de precios |
| [04-optimizador.md](04-optimizador.md) | Configuración del optimizador, Cálculo en curso, Resultados de ruta, Desglose de ahorro |
| [05-mapa-tiendas.md](05-mapa-tiendas.md) | Mapa con tiendas cercanas, Detalle de tienda, Filtros de mapa |
| [06-ocr-asistente.md](06-ocr-asistente.md) | Captura OCR (cámara/galería), Revisión de productos reconocidos, Chat del asistente IA |
| [07-perfil-ajustes.md](07-perfil-ajustes.md) | Perfil de usuario, Preferencias de optimización, Notificaciones, Ajustes de privacidad |
| [08-portal-pyme.md](08-portal-pyme.md) | Dashboard PYME (web), Gestión de precios, Crear promoción, Estadísticas |

---

## Convenciones de los wireframes

### Marcos de pantalla móvil

```
┌─────────────────────────┐   ← Borde del dispositivo
│ 09:41         ●●● ▶ 🔋 │   ← Status bar
│─────────────────────────│
│   [NOMBRE DE PANTALLA]  │   ← Título / Header
│─────────────────────────│
│                         │
│  Contenido principal    │
│                         │
│─────────────────────────│
│  [Tab 1] [Tab 2] [Tab3] │   ← Tab bar (si aplica)
└─────────────────────────┘
```

### Marcos de pantalla web

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business     [Nav items]    [Usuario ▼] │  ← Navbar
├────────────────────────────────────────────────────┤
│                                                    │
│   Contenido principal                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Elementos de UI comunes

| Símbolo | Significado |
|---------|-------------|
| `[Botón]` | Botón pulsable |
| `[● Opción]` | Radio button seleccionado |
| `[○ Opción]` | Radio button no seleccionado |
| `[✓ Opción]` | Checkbox marcado |
| `[□ Opción]` | Checkbox desmarcado |
| `[___________]` | Campo de texto / input |
| `▼` | Dropdown / selector |
| `◀ ▶` | Navegación paginación |
| `★` | Elemento destacado / favorito |
| `⚙` | Configuración |
| `🔍` | Búsqueda |
| `+` | Añadir elemento |
| `×` | Cerrar / eliminar |
| `←` | Volver atrás |
| `···` | Menú de opciones (kebab menu) |
| `░░░` | Imagen o área de mapa placeholder |
| `████` | Barra de progreso / relleno |
| `----` | Separador / divider |

---

## Flujo de navegación principal

```
                    ┌─────────────┐
                    │   Splash    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼──────┐          ┌───────▼──────┐
        │   Login    │          │   Registro   │
        └─────┬──────┘          └───────┬──────┘
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────────────────────┐
              │              TAB BAR                     │
              │  [🏠 Home] [📋 Listas] [🗺️ Mapa] [👤 Yo] │
              └────────┬──────────┬──────┬──────────────┘
                       │          │      │
              ┌────────▼─┐  ┌─────▼─┐  ┌▼────────────┐
              │   Home   │  │ Mapa  │  │    Perfil   │
              └────┬─────┘  └───────┘  └─────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
    ┌────▼───┐ ┌───▼────┐ ┌──▼────────┐
    │ Listas │ │Optimiz.│ │ Asistente │
    └────────┘ └────────┘ └───────────┘
```

---

*Generado automáticamente — BargAIn TFG — 2026*
