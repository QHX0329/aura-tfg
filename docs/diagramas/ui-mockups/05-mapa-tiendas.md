# Wireframes — Mapa y Tiendas

> **Pantallas:** Mapa con tiendas cercanas · Detalle de tienda · Filtros de mapa
> **Requisitos:** RF-011, RF-012, RF-013, RF-014
> **Historias de usuario:** HU-013, HU-014

---

## WF-05-01 · Mapa con Tiendas Cercanas

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│  🗺️ Mapa          [⚙]  │
│─────────────────────────│
│                         │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│  ░   [🔍 Buscar zona] ░  │
│  ░                    ░  │
│  ░    M          ░  │
│  ░       📍(Yo)       ░  │
│  ░  C           L     ░  │
│  ░         D          ░  │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│  [📍 Centrar]  [○ Radio]│
│                         │
│  ── Tiendas cercanas ── │
│                         │
│  ┌───────────────────┐  │
│  │ 🏪 Mercadona      │  │
│  │ C/ Gran Vía 12    │  │
│  │ 1,2 km · abierto  │  │
│  │ 8/8 prod. de tu   │  │
│  │ lista disponibles │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🏪 Lidl           │  │
│  │ C/ Real 45        │  │
│  │ 0,8 km · abierto  │  │
│  │ 6/8 prod. de tu   │  │
│  │ lista disponibles │  │
│  └───────────────────┘  │
│                         │
│─────────────────────────│
│  🏠    📋    🗺️    👤   │
└─────────────────────────┘
```

**Notas:**
- Los marcadores del mapa: `M` = Mercadona, `C` = Carrefour, `L` = Lidl, `D` = DIA.
- Marcadores de color verde si tiene todos los productos de la lista, amarillo si tiene algunos, gris si ninguno.
- Tap en marcador → popup con nombre, distancia y disponibilidad de productos.
- Tap en tarjeta del listado inferior → navega al detalle de tienda (WF-05-02).
- El listado inferior es deslizable (bottom sheet) con snappoints a 30%, 50%, 90% de la pantalla.

---

## WF-05-02 · Popup de Tienda en el Mapa

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│  ░░░░░░░░░░░░░░░░░░░░░  │
│  ░               [×]  ░  │
│  ░   [🔍 Buscar zona] ░  │
│  ░                    ░  │
│  ░         📍(Yo)     ░  │
│  ░                    ░  │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│                         │
│  ┌─────────────────────┐│
│  │ 🏪 Mercadona        ││
│  │ C/ Gran Vía 12      ││
│  │ ─────────────────── ││
│  │ 📏 1,2 km           ││
│  │ ⏱ ~12 min a pie     ││
│  │ 🕐 Hoy: 9:00–22:00  ││
│  │ ✅ Abierto ahora    ││
│  │ ─────────────────── ││
│  │ 8/8 productos de    ││
│  │ tu lista disponibles││
│  │ ─────────────────── ││
│  │ [Ver detalle]       ││
│  │ [🧭 Cómo llegar]    ││
│  └─────────────────────┘│
└─────────────────────────┘
```

---

## WF-05-03 · Detalle de Tienda

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Mercadona Gran Vía    │
│─────────────────────────│
│                         │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│  ░  [Mini mapa: loc.] ░  │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│                         │
│  🏪 Mercadona           │
│  C/ Gran Vía 12, Sevilla│
│  📏 1,2 km de ti        │
│                         │
│  ── Horario ──          │
│  Lun-Sáb: 9:00 – 22:00 │
│  Domingo: 10:00 – 21:00 │
│  ✅ Abierto ahora       │
│                         │
│  ☎ 955 12 34 56         │
│  🌐 mercadona.es        │
│                         │
│  ── Tu lista aquí ──    │
│                         │
│  ✅ Leche entera 2×1L   │
│     1,19 € / ud         │
│  ✅ Pan de molde 450g   │
│     1,39 €              │
│  ✅ Tomate frito 400g   │
│     0,85 €              │
│  ❌ Yogur Danone pack   │
│     No disponible       │
│                         │
│  Subtotal estimado:     │
│  ~14,80 € (8/8 prod.)   │
│                         │
│  ┌─────────────────┐    │
│  │ 🧭 Cómo llegar  │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## WF-05-04 · Filtros del Mapa

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│                         │
│  ┌─────────────────────┐│
│  │  Filtrar mapa     × ││
│  │─────────────────────││
│  │                     ││
│  │  ── Cadenas ──      ││
│  │  [✓] Mercadona      ││
│  │  [✓] Lidl           ││
│  │  [✓] Carrefour      ││
│  │  [✓] DIA            ││
│  │  [✓] Alcampo        ││
│  │  [□] Solo comercios ││
│  │       locales       ││
│  │                     ││
│  │  ── Estado ──       ││
│  │  [●] Abiertos ahora ││
│  │  [○] Todos          ││
│  │                     ││
│  │  ── Radio ──        ││
│  │  |──────●──────|    ││
│  │   1 km       10 km  ││
│  │   Actual: 5 km      ││
│  │                     ││
│  │  ── Disponibilidad──││
│  │  [✓] Solo con prod. ││
│  │       de mi lista   ││
│  │                     ││
│  │  ┌──────────────┐   ││
│  │  │  Aplicar (8) │   ││
│  │  └──────────────┘   ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Notas:**
- "Aplicar (8)" indica el número de tiendas que se mostrarán con los filtros actuales.
- "Solo comercios locales" filtra únicamente PYMEs adheridas al portal Business.
