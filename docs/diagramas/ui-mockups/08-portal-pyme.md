# Wireframes — Portal Business (PYME) Web

> **Pantallas:** Dashboard · Gestión de precios · Crear promoción · Estadísticas · Registro de negocio
> **Requisitos:** RF-036, RF-037, RF-038, RF-039, RF-040 (Portal Business)
> **Historias de usuario:** HU-020, HU-021, HU-022

> **Nota:** Estas pantallas son para la **interfaz web** del portal PYME (responsive).
> No es la app móvil. El actor es el **Comercio / PYME**.

---

## WF-08-01 · Login del Portal Business (Web)

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business                                │
├────────────────────────────────────────────────────┤
│                                                    │
│         ┌─────────────────────────────┐            │
│         │   Accede a tu panel PYME    │            │
│         │                             │            │
│         │  Correo electrónico         │            │
│         │  [_________________________]│            │
│         │                             │            │
│         │  Contraseña                 │            │
│         │  [_____________________] 👁 │            │
│         │                             │            │
│         │  ┌─────────────────────┐    │            │
│         │  │   Iniciar sesión    │    │            │
│         │  └─────────────────────┘    │            │
│         │                             │            │
│         │  [¿Olvidaste tu contraseña?]│            │
│         │                             │            │
│         │  ─────────── o ──────────── │            │
│         │                             │            │
│         │  ¿Aún no tienes cuenta?     │            │
│         │  [Registra tu negocio →]    │            │
│         │                             │            │
│         └─────────────────────────────┘            │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## WF-08-02 · Registro de Negocio (Onboarding PYME)

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business   Registra tu negocio          │
├────────────────────────────────────────────────────┤
│                                                    │
│  Paso 1 de 3: Datos del negocio                    │
│  [●────────────────────────────────]               │
│                                                    │
│  ┌───────────────────┐  ┌───────────────────┐     │
│  │ Nombre comercial  │  │ NIF / CIF         │     │
│  │ [________________]│  │ [________________]│     │
│  └───────────────────┘  └───────────────────┘     │
│                                                    │
│  Descripción del negocio                           │
│  [_________________________________________________│
│  _________________________________________________]│
│                                                    │
│  Dirección                                         │
│  [_________________________________________________]│
│                                                    │
│  Municipio                  Código postal          │
│  [____________________]     [_________]            │
│                                                    │
│  Categoría de negocio                              │
│  [Selecciona una categoría               ▼]        │
│                                                    │
│  Horario de apertura                               │
│  Lun-Vie: [09:00] – [21:00]                        │
│  Sáb:     [09:00] – [14:00]                        │
│  Dom:     [Cerrado ▼]                              │
│                                                    │
│                      ┌───────────────┐             │
│                      │    Siguiente →│             │
│                      └───────────────┘             │
└────────────────────────────────────────────────────┘
```

---

## WF-08-03 · Dashboard Principal PYME

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business  [Dashboard][Precios][Promo][📊]│  [Tienda El Rincón ▼] [👤]
├────────────────────────────────────────────────────┤
│                                                    │
│  Buenos días, María.    Tienda El Rincón Saludable │
│  Plan: Básico           📍 C/ Feria 32, Sevilla    │
│                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ 👁️ Vistas  │  │ 🛒 En lista│  │ 🔍 Búsqued.│   │
│  │            │  │ usuarios   │  │ recibidas  │   │
│  │    248     │  │    37      │  │    112     │   │
│  │ esta semana│  │ esta semana│  │ esta semana│   │
│  │ +12% ▲    │  │ +5% ▲     │  │ +8% ▲     │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│                                                    │
│  ┌──────────────────────────┐  ┌─────────────────┐│
│  │ Productos más vistos     │  │ Acciones rápidas ││
│  │ ─────────────────────── │  │ ─────────────── ││
│  │ 1. Miel Artesanal 500g  │  │ [+ Actualiz. pr.]││
│  │    89 vistas esta semana │  │ [+ Nueva promo]  ││
│  │ 2. Mermelada Fresa 250g │  │ [✏️ Editar perfil]││
│  │    67 vistas             │  │                  ││
│  │ 3. Aceite Oliva Extra 1L│  │ Estado: ✅ Activo ││
│  │    45 vistas             │  │ Verificado: ✅   ││
│  │ [Ver todos →]            │  │                  ││
│  └──────────────────────────┘  └─────────────────┘│
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ Alertas                                      │  │
│  │ ⚠️  Miel Artesanal: precio sin actualizar    │  │
│  │     desde hace 5 días (límite: 48h)          │  │
│  │                             [Actualizar →]   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## WF-08-04 · Gestión de Precios

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business  [Dashboard][Precios][Promo][📊]│  [Tienda El Rincón ▼] [👤]
├────────────────────────────────────────────────────┤
│                                                    │
│  Gestión de precios           [+ Añadir producto]  │
│                                                    │
│  [🔍 Buscar producto...  ]    [Filtrar ▼]          │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ Producto          Precio  Oferta  Act.  Acc. │  │
│  ├──────────────────────────────────────────────┤  │
│  │ 🍯 Miel Artesanal │       │       │      │   │  │
│  │    Tarro 500g     │  8,50 │   —   │⚠️5d │[✏️]│  │
│  ├──────────────────────────────────────────────┤  │
│  │ 🍓 Mermelada Fresa│       │       │      │   │  │
│  │    Frasco 250g    │  3,20 │  2,80 │ ✅2h │[✏️]│  │
│  ├──────────────────────────────────────────────┤  │
│  │ 🫒 AOVE Extra 1L  │       │       │      │   │  │
│  │    Botella        │ 12,00 │   —   │ ✅1h │[✏️]│  │
│  ├──────────────────────────────────────────────┤  │
│  │ 🌾 Pan Artesano   │       │       │      │   │  │
│  │    Hogaza 800g    │  4,50 │   —   │ ✅3h │[✏️]│  │
│  ├──────────────────────────────────────────────┤  │
│  │ 🧀 Queso Manchego │       │       │      │   │  │
│  │    Cuña 200g      │  5,80 │  4,90 │ ✅1h │[✏️]│  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Mostrando 5 de 18 productos    [◀ 1 2 3 4 ▶]     │
└────────────────────────────────────────────────────┘
```

---

## WF-08-05 · Modal Editar Precio de Producto

```
┌────────────────────────────────────────────────────┐
│                                                    │
│    ┌────────────────────────────────┐              │
│    │  Actualizar precio           × │              │
│    │────────────────────────────────│              │
│    │                                │              │
│    │  🍯 Miel Artesanal 500g        │              │
│    │                                │              │
│    │  Precio actual                 │              │
│    │  [8,50_______] €               │              │
│    │                                │              │
│    │  Precio de oferta (opcional)   │              │
│    │  [_________] €                 │              │
│    │                                │              │
│    │  Válido hasta                  │              │
│    │  [DD/MM/AAAA]                  │              │
│    │                                │              │
│    │  Precio por unidad             │              │
│    │  [17,00______] €/kg (auto)     │              │
│    │                                │              │
│    │  Stock                         │              │
│    │  [●] Disponible                │              │
│    │  [○] Sin stock                 │              │
│    │                                │              │
│    │    ┌────────┐  ┌─────────────┐ │              │
│    │    │Cancelar│  │   Guardar   │ │              │
│    │    └────────┘  └─────────────┘ │              │
│    └────────────────────────────────┘              │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## WF-08-06 · Crear Promoción

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business  [Dashboard][Precios][Promo][📊]│  [Tienda El Rincón ▼] [👤]
├────────────────────────────────────────────────────┤
│                                                    │
│  Nueva promoción                                   │
│                                                    │
│  Producto                                          │
│  [🔍 Buscar en tu catálogo...              ]       │
│                                                    │
│  Tipo de descuento                                 │
│  [●] Porcentaje     [○] Importe fijo               │
│                                                    │
│  Descuento (%)                                     │
│  [15_______] %                                     │
│                                                    │
│  Precio original: 8,50 €  →  Precio promo: 7,23 € │
│                                                    │
│  Período de validez                                │
│  Inicio: [10/03/2026]  Fin: [17/03/2026]          │
│                                                    │
│  Descripción de la oferta (opcional)               │
│  [_________________________________________________│
│  ]                                                 │
│                                                    │
│  Vista previa en la app:                           │
│  ┌──────────────────────────────┐                  │
│  │ 🍯 Miel Artesanal 500g       │                  │
│  │ ~~8,50 €~~ → 7,23 € ★ -15%  │                  │
│  │ Válido hasta 17/03/2026      │                  │
│  └──────────────────────────────┘                  │
│                                                    │
│            ┌────────┐  ┌────────────────────┐     │
│            │Cancelar│  │  Publicar promoción│     │
│            └────────┘  └────────────────────┘     │
└────────────────────────────────────────────────────┘
```

---

## WF-08-07 · Estadísticas (Plan Básico / Premium)

```
┌────────────────────────────────────────────────────┐
│ 🛒 BargAIn Business  [Dashboard][Precios][Promo][📊]│  [Tienda El Rincón ▼] [👤]
├────────────────────────────────────────────────────┤
│                                                    │
│  Estadísticas       Período: [Esta semana ▼]       │
│                                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ Vistas del catálogo                           │ │
│  │                                               │ │
│  │  L    M    X    J    V    S    D              │ │
│  │       ██        ██   ██                       │ │
│  │  ██   ██   ██   ██   ██   █                   │ │
│  │  ─────────────────────────────────────       │ │
│  │  24   38   31   45   52   18   0              │ │
│  └───────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │ Top productos    │  │ Embudo de conversión  │   │
│  │ ─────────────── │  │ ────────────────────  │   │
│  │ 1. Miel    89 v.│  │ Vista catálogo: 248   │   │
│  │ 2. Merm.   67 v.│  │ Detalle prod.:   89   │   │
│  │ 3. AOVE    45 v.│  │ Añadido a lista: 37   │   │
│  │ 4. Pan     34 v.│  │ Ratio: 14,9%          │   │
│  │ 5. Queso   28 v.│  │                       │   │
│  └──────────────────┘  └──────────────────────┘   │
│                                                    │
│  🔒 Estadísticas avanzadas (localización,          │
│     comparativa de sector, etc.) disponibles       │
│     en el Plan Premium.                            │
│     [Actualizar a Premium →]                       │
└────────────────────────────────────────────────────┘
```

**Notas:**
- Plan gratuito: métricas básicas (vistas, añadidos a lista, últimos 7 días).
- Plan básico: embudo de conversión, top productos, histórico 30 días.
- Plan premium: comparativa con sector, mapa de calor de búsquedas, exportación CSV.
- El badge `🔒` indica funcionalidades bloqueadas por plan.
