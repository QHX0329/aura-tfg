# Wireframes — OCR y Asistente IA

> **Pantallas:** Captura OCR · Revisión de productos reconocidos · Chat del asistente IA · Historial de conversaciones
> **Requisitos:** RF-030, RF-031, RF-032, RF-033, RF-034, RF-035
> **Historias de usuario:** HU-015, HU-016, HU-017, HU-018

---

## WF-06-01 · Acceso a OCR (Modal de selección)

```
┌─────────────────────────┐
│                         │
│                         │
│  ┌─────────────────────┐│
│  │ Capturar lista    × ││
│  │─────────────────────││
│  │                     ││
│  │  📷 Cámara          ││
│  │  Fotografía tu lista ││
│  │  o ticket de compra ││
│  │  [Abrir cámara  →]  ││
│  │                     ││
│  │  ─────────────────  ││
│  │                     ││
│  │  🖼️ Galería          ││
│  │  Selecciona una foto ││
│  │  ya tomada           ││
│  │  [Elegir foto   →]  ││
│  │                     ││
│  │  ─────────────────  ││
│  │                     ││
│  │  📄 Documento       ││
│  │  PDF o imagen de    ││
│  │  lista escaneada    ││
│  │  [Seleccionar   →]  ││
│  │                     ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

---

## WF-06-02 · Cámara OCR (vista de captura)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ [×] Cancelar   [💡 Flash]│
│─────────────────────────│
│                         │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│  ░                    ░  │
│  ░   ┌─────────────┐  ░  │
│  ░   │             │  ░  │
│  ░   │  LISTA /    │  ░  │
│  ░   │  TICKET     │  ░  │
│  ░   │  AQUÍ       │  ░  │
│  ░   │             │  ░  │
│  ░   └─────────────┘  ░  │
│  ░                    ░  │
│  ░░░░░░░░░░░░░░░░░░░░░  │
│                         │
│  Centra el texto en el  │
│  recuadro               │
│                         │
│         ⭕              │
│    [Hacer foto]         │
│                         │
│  [Galería]    [Consejo] │
└─────────────────────────┘
```

**Notas:**
- El recuadro de guía se adapta a portrait (lista escrita) o landscape (ticket de caja).
- La detección automática de bordes del documento activa el recuadro en verde.
- Modo de alto contraste disponible para documentos de baja calidad.

---

## WF-06-03 · OCR Procesando

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│                         │
│                         │
│   ░░░░░░░░░░░░░░░░░░░   │
│   ░   [Imagen      ] ░  │
│   ░   [capturada   ] ░  │
│   ░░░░░░░░░░░░░░░░░░░   │
│                         │
│         🔍              │
│   Analizando imagen...  │
│                         │
│   ████████████░░░░░░░   │
│                         │
│   ✓ Imagen procesada    │
│   ✓ Texto extraído      │
│   ⟳ Identificando       │
│     productos...        │
│                         │
│   Por favor espera,     │
│   esto tarda un momento.│
│                         │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

---

## WF-06-04 · Revisión de Productos OCR reconocidos

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Revisar productos     │
│─────────────────────────│
│  Hemos encontrado 9     │
│  productos. Revísalos.  │
│─────────────────────────│
│                         │
│  ✅ Alta confianza (7)  │
│                         │
│  [✓] Leche entera 1L    │
│      → Leche Entera 1L  │
│        Hacendado ✓      │
│                         │
│  [✓] Pan Bimbo molde    │
│      → Pan Molde Bimbo  │
│        480g ✓           │
│                         │
│  [✓] Aceite de oliva    │
│      → AOVE Carbonell   │
│        750ml ✓          │
│  (+ 4 más confirmados)  │
│                         │
│  ⚠️ Revisar (2)         │
│                         │
│  [?] "tomate triturad"  │
│      [Tomate triturado ▼│
│       Hacendado 400g]   │
│      [Seleccionar otro] │
│                         │
│  [?] "papel WC"        │
│      [Papel higiénico ▼ │
│       Renova 12 rollos] │
│      [Seleccionar otro] │
│                         │
│  ┌─────────────────┐    │
│  │ Añadir a lista  │    │
│  │  (9 productos)  │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

**Notas:**
- Los ítems de "alta confianza" están pre-seleccionados; el usuario puede desmarcarlos.
- Los ítems de "revisar" muestran la sugerencia más probable con dropdown de alternativas.
- "Seleccionar otro" abre el buscador inline (WF-02-05) para buscar manualmente.
- "Añadir a lista" lleva al selector de lista y luego añade todos los ítems seleccionados.

---

## WF-06-05 · Chat del Asistente IA

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← 🤖 Asistente BargAIn  │
│─────────────────────────│
│                         │
│   ─────── hoy ─────     │
│                         │
│   ┌─────────────────┐   │
│   │ 🤖                │  │
│   │ ¡Hola! Soy tu   │   │
│   │ asistente de    │   │
│   │ compra. Puedo   │   │
│   │ ayudarte con    │   │
│   │ precios, listas │   │
│   │ y recomendac.   │   │
│   └─────────────────┘   │
│                         │
│              ┌────────┐ │
│              │ ¿Cuál  │ │
│              │ es el  │ │
│              │ precio │ │
│              │ de la  │ │
│              │ leche  │ │
│              │ en Lidl│ │
│              └────────┘ │
│   ┌─────────────────┐   │
│   │ 🤖                │  │
│   │ En el Lidl de   │   │
│   │ C/ Real 45 (0,8 │   │
│   │ km de ti) la    │   │
│   │ leche entera 1L │   │
│   │ está a 0,89 €   │   │
│   │ (actualizado    │   │
│   │ hace 2 horas).  │   │
│   │                 │   │
│   │ [Ver en mapa →] │   │
│   └─────────────────┘   │
│─────────────────────────│
│  [📎] [Escribe aquí...] │
│                    [➤]  │
└─────────────────────────┘
```

**Notas:**
- El asistente solo responde consultas de compra (guardrail de dominio).
- El botón `[📎]` permite adjuntar imagen (lista, ticket) para análisis.
- Los mensajes del asistente pueden incluir tarjetas interactivas (enlaces a productos, tiendas, mapas).
- Historial persistido en backend (RF-034).

---

## WF-06-06 · Sugerencias rápidas del Asistente

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← 🤖 Asistente BargAIn  │
│─────────────────────────│
│                         │
│   ┌─────────────────┐   │
│   │ 🤖                │  │
│   │ ¡Hola de nuevo! │   │
│   │ ¿En qué puedo   │   │
│   │ ayudarte hoy?   │   │
│   └─────────────────┘   │
│                         │
│  ── Prueba a preguntar──│
│                         │
│  ┌────────────────────┐ │
│  │ ¿Dónde está más   │ │
│  │ barata la leche?  │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │ Optimiza mi lista │ │
│  │ de la compra      │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │ ¿Qué supermercado │ │
│  │ tengo más cerca?  │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │ ¿Hay ofertas de   │ │
│  │ yogures hoy?      │ │
│  └────────────────────┘ │
│                         │
│─────────────────────────│
│  [📎] [Escribe aquí...] │
│                    [➤]  │
└─────────────────────────┘
```

---

## WF-06-07 · Historial de Conversaciones

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│  🤖 Asistente     [+]  │
│─────────────────────────│
│                         │
│  ┌───────────────────┐  │
│  │ Hoy               │  │
│  │ "¿Dónde está más  │  │
│  │  barata la leche?"│  │
│  │ hace 5 min        │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Ayer              │  │
│  │ "Optimiza mi lista│  │
│  │  del lunes"       │  │
│  │ 09/03/2026        │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ La semana pasada  │  │
│  │ "¿Qué cadena tie- │  │
│  │  ne más sucursales│  │
│  │  en mi zona?"     │  │
│  │ 05/03/2026        │  │
│  └───────────────────┘  │
│                         │
│                         │
│─────────────────────────│
│  🏠    📋    🗺️    👤   │
└─────────────────────────┘
```

**Notas:**
- El botón `[+]` inicia una nueva conversación.
- Swipe izquierdo sobre tarjeta → archivar/eliminar conversación.
