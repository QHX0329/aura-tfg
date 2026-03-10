# Wireframes — Home y Listas de la Compra

> **Pantallas:** Home / Dashboard · Lista de listas · Detalle de lista · Añadir ítem
> **Requisitos:** RF-017, RF-018, RF-019, RF-020, RF-021, RF-022
> **Historias de usuario:** HU-007, HU-008, HU-009

---

## WF-02-01 · Home / Dashboard

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│  Hola, Nicolás 👋       │
│  Sevilla · 📍 2.3 km radio│
│─────────────────────────│
│                         │
│  ── Lista activa ──     │
│  📋 Compra semanal      │
│  8 productos · 2 pend.  │
│  ┌─────────────────┐    │
│  │  Ver mi lista   │    │
│  └─────────────────┘    │
│                         │
│  ── Accesos rápidos ──  │
│  ┌──────┐  ┌──────┐     │
│  │  🔍  │  │  🗺️  │     │
│  │Buscar│  │ Mapa │     │
│  └──────┘  └──────┘     │
│  ┌──────┐  ┌──────┐     │
│  │  📷  │  │  🤖  │     │
│  │  OCR │  │  IA  │     │
│  └──────┘  └──────┘     │
│                         │
│  ── Alertas de precio ──│
│  🔻 Leche Asturiana -8% │
│     Mercadona · hoy     │
│  🔻 Pan integral  -5%   │
│     Lidl · ayer         │
│                         │
│─────────────────────────│
│  🏠    📋    🗺️    👤   │
│ Home  Listas Mapa  Yo   │
└─────────────────────────┘
```

**Notas:**
- "Lista activa" muestra la última lista usada por el usuario.
- Las alertas de precio se basan en productos de las listas del usuario.
- El radio de búsqueda se muestra junto a la ubicación; tap → configurar.

---

## WF-02-02 · Listado de Listas de la Compra

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│  Mis listas        [+]  │
│─────────────────────────│
│                         │
│  ┌───────────────────┐  │
│  │ 📋 Compra semanal │  │
│  │ 8 productos · act │  │
│  │ Últ. modif.: hoy  │  │
│  │              [···]│  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 📋 Cena del sábado│  │
│  │ 5 productos · act │  │
│  │ Últ. modif.: ayer │  │
│  │              [···]│  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 📋 Mes de marzo   │  │
│  │ 22 prod. · archiv.│  │
│  │ Últ. modif.: 5 mar│  │
│  │              [···]│  │
│  └───────────────────┘  │
│                         │
│  ┌─────────────────────┐│
│  │  + Nueva lista      ││
│  └─────────────────────┘│
│─────────────────────────│
│  🏠    📋    🗺️    👤   │
│ Home  Listas Mapa  Yo   │
└─────────────────────────┘
```

**Notas:**
- El botón `[+]` en el header abre el modal de crear lista.
- El botón `[···]` (kebab) despliega: Editar nombre / Compartir / Archivar / Eliminar.
- Swipe izquierdo sobre tarjeta → acciones rápidas (archivar, eliminar).
- Las listas archivadas aparecen al final con indicador visual.

---

## WF-02-03 · Modal Crear / Renombrar Lista

```
┌─────────────────────────┐
│                         │
│                         │
│  ┌─────────────────────┐│
│  │  Nueva lista      × ││
│  │─────────────────────││
│  │                     ││
│  │  Nombre de la lista ││
│  │  [___________________││
│  │  _________________] ││
│  │                     ││
│  │  Icono (opcional)   ││
│  │  📋 🛒 🥦 🍖 🧹 ···││
│  │                     ││
│  │  ┌───────────────┐  ││
│  │  │  Crear lista  │  ││
│  │  └───────────────┘  ││
│  │                     ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

---

## WF-02-04 · Detalle de Lista (Activa)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Compra semanal   [···]│
│─────────────────────────│
│                         │
│  ┌─────────────────┐    │
│  │ 🚀 Optimizar    │    │  ← CTA principal
│  │    ruta (8 prod)│    │
│  └─────────────────┘    │
│                         │
│  [🔍 Añadir producto... ]│
│                         │
│  ── Pendientes (6) ──   │
│                         │
│  □ Leche entera         │
│    2 × 1L · ~1,20 €     │
│                      ···│
│  □ Pan de molde         │
│    1 × 450g · ~1,50 €   │
│                      ···│
│  □ Tomate frito         │
│    2 × 400g · ~0,80 €   │
│                      ···│
│  □ Pollo entero         │
│    1 × ~1,5kg · ~6,00 € │
│                      ···│
│  □ Manzanas Fuji        │
│    1kg · ~2,20 €        │
│                      ···│
│  □ Yogures naturales    │
│    4 ud. · ~1,00 €      │
│                      ···│
│                         │
│  ── Comprados (2) ──    │
│                         │
│  ✓ Aceite de oliva      │
│  ✓ Detergente lavavajil.│
│                         │
│  ── Total estimado ──   │
│  ~14,70 € (min. estimado│
│  según precios actuales)│
│                         │
│─────────────────────────│
│  🏠    📋    🗺️    👤   │
│ Home  Listas Mapa  Yo   │
└─────────────────────────┘
```

**Notas:**
- Tap sobre ítem → marcar como comprado (tachado + check).
- El botón `[···]` sobre ítem → Editar cantidad / Ver precios / Eliminar.
- El CTA "Optimizar ruta" es contextual y muestra el nº de productos pendientes.
- El precio estimado usa el precio más bajo disponible en tiendas del radio.

---

## WF-02-05 · Detalle de Lista — Añadir Producto (Búsqueda inline)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Compra semanal        │
│─────────────────────────│
│                         │
│  [🔍 leche___________×] │  ← Campo activo
│                         │
│  ── Sugerencias ──      │
│                         │
│  🥛 Leche entera 1L     │
│     Desde 0,89 € · 5 t. │
│  ─────────────────────  │
│  🥛 Leche semidesnat. 1L│
│     Desde 0,79 € · 5 t. │
│  ─────────────────────  │
│  🥛 Leche desnatada 1L  │
│     Desde 0,75 € · 4 t. │
│  ─────────────────────  │
│  🥛 Bebida de avena 1L  │
│     Desde 1,29 € · 3 t. │
│  ─────────────────────  │
│                         │
│  ¿No encuentras tu      │
│  producto?              │
│  [+ Añadir manualmente] │
│                         │
│                         │
└─────────────────────────┘
```

---

## WF-02-06 · Modal Configurar Ítem (cantidad y notas)

```
┌─────────────────────────┐
│                         │
│  ┌─────────────────────┐│
│  │ Añadir a la lista × ││
│  │─────────────────────││
│  │                     ││
│  │  🥛 Leche entera 1L ││
│  │  Mercadona · Lidl +3││
│  │                     ││
│  │  Cantidad           ││
│  │  [-]  2  [+]        ││
│  │                     ││
│  │  Unidad             ││
│  │  [Litros         ▼] ││
│  │                     ││
│  │  Nota (opcional)    ││
│  │  [___________________││
│  │  ]                  ││
│  │                     ││
│  │  ┌───────────────┐  ││
│  │  │ Añadir a lista│  ││
│  │  └───────────────┘  ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

---

## WF-02-07 · Detalle de Lista — Compartir

```
┌─────────────────────────┐
│                         │
│  ┌─────────────────────┐│
│  │ Compartir lista   × ││
│  │─────────────────────││
│  │                     ││
│  │  Invitar por correo ││
│  │  [___________________││
│  │  _________________] ││
│  │  [+ Añadir persona] ││
│  │                     ││
│  │  Personas con acceso││
│  │  ─────────────────  ││
│  │  👤 Ana G. (tú)     ││
│  │     Propietaria     ││
│  │  👤 Marta P.        ││
│  │     Puede editar    ││
│  │                     ││
│  │  [○] Puede ver      ││
│  │  [●] Puede editar   ││
│  │                     ││
│  │  ┌───────────────┐  ││
│  │  │  Copiar enlace│  ││
│  │  └───────────────┘  ││
│  └─────────────────────┘│
└─────────────────────────┘
```
