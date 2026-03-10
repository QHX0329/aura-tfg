# Wireframes — Optimizador de Ruta

> **Pantallas:** Configuración · Cálculo en curso · Resultados de ruta · Desglose de ahorro · Detalle por parada
> **Requisitos:** RF-025, RF-026, RF-027, RF-028, RF-029
> **Historias de usuario:** HU-010, HU-011, HU-012

---

## WF-04-01 · Configuración del Optimizador

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Optimizar ruta        │
│─────────────────────────│
│                         │
│  Lista: Compra semanal  │
│  8 productos pendientes │
│                         │
│  ── Ubicación de salida─│
│  [📍 Mi ubicación actual]│
│  [○ Introducir dirección]│
│                         │
│  ── Radio máximo ──     │
│  |──────────●──────────|│
│    1 km          25 km  │
│       Actual: 5 km      │
│                         │
│  ── Máx. paradas ──     │
│     [1]  [2]  [●3]  [4] │
│                         │
│  ── Prioridad ──        │
│  Precio    [████████░░] │  70%
│  Distancia [████░░░░░░] │  30%
│  Tiempo    [░░░░░░░░░░] │   0%
│                         │
│  (Los pesos suman 100%) │
│                         │
│  [□] Recordar preferenc.│
│                         │
│  ┌─────────────────┐    │
│  │  🚀 Calcular    │    │
│  │     ruta óptima │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

**Notas:**
- Los sliders de prioridad están enlazados: al mover uno, los demás se reajustan para sumar 100%.
- El selector de paradas usa botones tipo "chip" (1, 2, 3, 4).
- "Recordar preferencias" guarda los pesos en el perfil del usuario (RF-004).
- Tap en "Mi ubicación actual" → solicita permiso de geolocalización si no fue concedido.

---

## WF-04-02 · Cálculo en Curso (Loading)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│                         │
│                         │
│         🚀              │
│                         │
│  Calculando tu ruta     │
│  óptima...              │
│                         │
│  ████████████░░░░░░░░   │
│                         │
│  ✓ Buscando precios     │
│    en 12 tiendas        │
│  ✓ Evaluando 48 combina-│
│    ciones de paradas    │
│  ⟳ Calculando distancias│
│    y tiempos...         │
│                         │
│  Esto puede tardar      │
│  unos segundos.         │
│                         │
│                         │
│                         │
│  [Cancelar]             │
└─────────────────────────┘
```

**Notas:**
- Los pasos del proceso se muestran en tiempo real vía WebSocket o polling.
- La barra de progreso avanza a medida que el backend completa cada fase.
- "Cancelar" interrumpe el cálculo y vuelve a WF-04-01.

---

## WF-04-03 · Resultados del Optimizador (Top 3 rutas)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Rutas sugeridas       │
│─────────────────────────│
│  Para: Compra semanal   │
│  8 productos · radio 5km│
│─────────────────────────│
│                         │
│  ┌───────────────────┐  │
│  │ ⭐ MEJOR OPCIÓN   │  │
│  │ Mercadona + Lidl  │  │
│  │                   │  │
│  │ 💰 14,20 € total  │  │
│  │ 📏 2,8 km total   │  │
│  │ ⏱ ~25 min         │  │
│  │ 💚 Ahorras 3,40 € │  │
│  │                   │  │
│  │ [Ver detalle  →]  │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Opción 2          │  │
│  │ Mercadona + DIA   │  │
│  │                   │  │
│  │ 💰 15,10 € total  │  │
│  │ 📏 1,9 km total   │  │
│  │ ⏱ ~18 min         │  │
│  │ 💚 Ahorras 2,50 € │  │
│  │                   │  │
│  │ [Ver detalle  →]  │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Opción 3          │  │
│  │ Solo Mercadona    │  │
│  │                   │  │
│  │ 💰 17,60 € total  │  │
│  │ 📏 1,2 km total   │  │
│  │ ⏱ ~10 min         │  │
│  │ ──  Sin ahorro    │  │
│  │                   │  │
│  │ [Ver detalle  →]  │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

**Notas:**
- La "Mejor opción" está determinada por los pesos configurados por el usuario.
- El ahorro se calcula respecto a comprar todos los productos en la tienda más cara del radio.
- Tap en "Ver detalle" → WF-04-04 (Ruta en mapa).

---

## WF-04-04 · Detalle de Ruta en Mapa

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Ruta: Mercadona + Lidl│
│─────────────────────────│
│                         │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│  ░                    ░  │
│  ░  [Mapa Google]     ░  │
│  ░                    ░  │
│  ░  📍 Tú             ░  │
│  ░    │               ░  │
│  ░  1️⃣ Lidl (0,8 km)  ░  │
│  ░    │               ░  │
│  ░  2️⃣ Mercadona      ░  │
│  ░     (2,0 km)       ░  │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│                         │
│  ── Paradas ──          │
│  1️⃣ Lidl C/ Real 45     │
│     0,8 km · 7 min      │
│     4 productos · 6,20 €│
│     [Ver productos]     │
│                         │
│  2️⃣ Mercadona Gran Vía  │
│     2,0 km · 18 min     │
│     4 productos · 8,00 €│
│     [Ver productos]     │
│                         │
│  ── Resumen ──          │
│  Total: 14,20 € · 25min │
│  Ahorro estimado: 3,40 €│
│                         │
│  ┌─────────────────┐    │
│  │  🧭 Iniciar ruta│    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## WF-04-05 · Detalle por Parada (qué comprar)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← 1️⃣ Lidl C/ Real 45    │
│─────────────────────────│
│  0,8 km · Abierto hasta │
│  21:30 · ☎ 955 12 34 56 │
│─────────────────────────│
│                         │
│  Comprar aquí (4 prod.):│
│                         │
│  □ Leche entera 2×1L    │
│    0,89 € / ud · 1,78 € │
│    (vs Mercadona 1,19 €)│
│    💚 Ahorro: 0,62 €    │
│                         │
│  □ Pan de molde 450g    │
│    1,29 € · 1 ud        │
│    (vs Carrefour 1,59 €)│
│    💚 Ahorro: 0,30 €    │
│                         │
│  □ Yogures pack 4 ud    │
│    0,99 € · 1 pk        │
│    (vs Mercadona 1,29 €)│
│    💚 Ahorro: 0,30 €    │
│                         │
│  □ Aceite oliva 1L      │
│    4,29 € · 1 ud        │
│    (vs DIA 5,50 €)      │
│    💚 Ahorro: 1,21 €    │
│                         │
│  Subtotal: 8,35 €       │
│  Ahorro en esta parada: │
│  2,43 €                 │
│                         │
│  ┌─────────────────┐    │
│  │ Marcar y seguir │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## WF-04-06 · Desglose de Ahorro Total

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Desglose de ahorro    │
│─────────────────────────│
│                         │
│        💚               │
│  Ahorro total: 3,40 €   │
│  (vs compra en un único │
│   supermercado más caro)│
│                         │
│  ── Por tienda ──       │
│                         │
│  1️⃣ Lidl                │
│  ████████████░░   2,43 €│
│                         │
│  2️⃣ Mercadona           │
│  ████░░░░░░░░░░   0,97 €│
│                         │
│  ── Por producto ──     │
│                         │
│  Aceite oliva    1,21 € │
│  Leche entera    0,62 € │
│  Yogures         0,30 € │
│  Pan de molde    0,30 € │
│  Tomate frito    0,25 € │
│  Pollo           0,22 € │
│                         │
│  ── Comparativa ──      │
│  Sin optimizar: 17,60 € │
│  Con BargAIn:   14,20 € │
│  Diferencia: -19,3%     │
│                         │
│  [Compartir mi ahorro 🔗]│
└─────────────────────────┘
```

**Notas:**
- El botón "Compartir mi ahorro" genera una imagen/tarjeta compartible.
- El ahorro de referencia usa la compra completa en el supermercado más caro del radio.
