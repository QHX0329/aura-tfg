# Wireframes — Perfil y Ajustes

> **Pantallas:** Perfil de usuario · Preferencias de optimización · Notificaciones · Privacidad y datos
> **Requisitos:** RF-003, RF-004, RF-005
> **Historias de usuario:** HU-003, HU-004

---

## WF-07-01 · Pantalla Mi Perfil (Tab "Yo")

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│  Mi perfil              │
│─────────────────────────│
│                         │
│        ░░░░░            │
│        ░👤░             │  ← Avatar
│        ░░░░░            │
│       [Editar foto]     │
│                         │
│  Nicolás Parrilla Geniz │
│  nicolas@ejemplo.com    │
│  Miembro desde mar 2026 │
│                         │
│─────────────────────────│
│                         │
│  ─── Mi cuenta ───      │
│                         │
│  👤 Datos personales  > │
│  🔒 Cambiar contraseña> │
│  📍 Ubicación defecto > │
│                         │
│  ─── Preferencias ───   │
│                         │
│  🚀 Optimización      > │
│  🔔 Notificaciones    > │
│  🌍 Idioma      Español │
│                         │
│  ─── Cuenta ───         │
│                         │
│  ℹ️ Sobre BargAIn      > │
│  📋 Términos de uso    > │
│  🔐 Política privacidad>│
│                         │
│  [Cerrar sesión]        │
│                         │
│─────────────────────────│
│  🏠    📋    🗺️    👤   │
└─────────────────────────┘
```

---

## WF-07-02 · Editar Datos Personales

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Datos personales      │
│                 [Guardar]│
│─────────────────────────│
│                         │
│  Nombre                 │
│  [Nicolás_______________]│
│                         │
│  Apellidos              │
│  [Parrilla Geniz________]│
│                         │
│  Correo electrónico     │
│  [nicolas@ejemplo.com___]│
│  ℹ️ Cambiar email requiere│
│  verificación           │
│                         │
│  Teléfono (opcional)    │
│  [+34 600 000 000_______]│
│                         │
│  ─── Ubicación por def. ─│
│                         │
│  [📍 C/ Recaredo 15,    │
│      Sevilla       →]   │
│                         │
│  ─── Radio de búsqueda ─│
│  |──────────●──────────|│
│    1 km          25 km  │
│       Actual: 10 km     │
│                         │
│                         │
└─────────────────────────┘
```

---

## WF-07-03 · Preferencias de Optimización

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Optimización          │
│                 [Guardar]│
│─────────────────────────│
│                         │
│  ─── Modo ───           │
│                         │
│  [●] Precio             │
│      Maximiza el ahorro │
│  [○] Distancia          │
│      Minimiza el recorr.│
│  [○] Tiempo             │
│      Minimiza el tiempo │
│  [○] Personalizado      │
│      Ajusta los pesos   │
│                         │
│  ─── Pesos personalizad ─│
│                         │
│  Precio                 │
│  [░░░░░░░░░░░░] 60%     │
│                         │
│  Distancia              │
│  [░░░░░░░░] 30%         │
│                         │
│  Tiempo                 │
│  [░░░░] 10%             │
│                         │
│  ─── Número de paradas ─│
│     [1]  [2]  [●3]  [4] │
│                         │
│  ─── Radio máximo ───   │
│  |──────────●──────────|│
│    1 km          25 km  │
│       Actual: 10 km     │
│                         │
└─────────────────────────┘
```

**Notas:**
- Al seleccionar "Personalizado", los sliders de pesos se habilitan y permiten ajuste manual.
- Los sliders están interconectados: la suma siempre es 100%.
- Los cambios se aplican por defecto en futuras optimizaciones (sobreescribibles por sesión).

---

## WF-07-04 · Notificaciones

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Notificaciones        │
│─────────────────────────│
│                         │
│  ─── Push (móvil) ───   │
│                         │
│  🔔 Alertas de precio   │
│  Avísame si baja el     │
│  precio de productos    │
│  en mi lista            │
│            [●──○] ON    │
│                         │
│  🔔 Ofertas y promoc.   │
│  Nuevas ofertas en      │
│  tiendas cercanas       │
│            [○──●] OFF   │
│                         │
│  🔔 Recordatorios       │
│  Recordar completar     │
│  listas pendientes      │
│            [●──○] ON    │
│                         │
│  ─── Email ───          │
│                         │
│  📧 Resumen semanal     │
│  Email con los mejores  │
│  precios de la semana   │
│            [○──●] OFF   │
│                         │
│  📧 Alertas importantes │
│  Cambios en la cuenta   │
│            [●──○] ON    │
│                         │
│  ─── Umbral de alerta ─ │
│  Avisar si precio baja  │
│  más de: [5__]%         │
│                         │
└─────────────────────────┘
```

---

## WF-07-05 · Privacidad y Datos

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Privacidad y datos    │
│─────────────────────────│
│                         │
│  ─── Geolocalización ── │
│                         │
│  📍 Usar ubicación      │
│     En primer plano     │
│            [●──○] ON    │
│                         │
│  ─── Datos de uso ───   │
│                         │
│  📊 Análisis anónimos   │
│  Ayuda a mejorar la app │
│            [●──○] ON    │
│                         │
│  ─── Mis datos ───      │
│                         │
│  📥 Descargar mis datos │
│  Exportar historial,    │
│  listas y preferencias  │
│                      [>]│
│                         │
│  ─── Zona de peligro ─  │
│                         │
│  🗑️ Eliminar historial  │
│  de búsqueda            │
│                      [>]│
│                         │
│  ❌ Eliminar cuenta     │
│  Elimina todos tus datos│
│  permanentemente        │
│                      [>]│
│                         │
└─────────────────────────┘
```

---

## WF-07-06 · Confirmación Eliminar Cuenta

```
┌─────────────────────────┐
│                         │
│                         │
│  ┌─────────────────────┐│
│  │ ⚠️ Eliminar cuenta  ││
│  │─────────────────────││
│  │                     ││
│  │ Esta acción es      ││
│  │ IRREVERSIBLE.       ││
│  │                     ││
│  │ Se eliminarán:      ││
│  │ • Tu perfil         ││
│  │ • Todas tus listas  ││
│  │ • Historial de      ││
│  │   conversaciones    ││
│  │ • Preferencias      ││
│  │                     ││
│  │ Escribe tu email    ││
│  │ para confirmar:     ││
│  │ [___________________││
│  │ ]                   ││
│  │                     ││
│  │ ┌─────────────────┐ ││
│  │ │ Eliminar cuenta │ ││  ← Botón rojo
│  │ └─────────────────┘ ││
│  │                     ││
│  │ [Cancelar]          ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```
