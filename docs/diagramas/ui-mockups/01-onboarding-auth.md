# Wireframes — Onboarding y Autenticación

> **Pantallas:** Splash · Bienvenida · Login · Registro · Recuperar contraseña
> **Requisitos:** RF-001, RF-002, RF-005
> **Historias de usuario:** HU-001, HU-002

---

## WF-01-01 · Pantalla Splash

```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│                         │
│      ╔═══════════╗      │
│      ║  🛒       ║      │
│      ║ BargAIn   ║      │
│      ╚═══════════╝      │
│                         │
│   Compra inteligente.   │
│   Compra mejor.         │
│                         │
│         ████████        │
│       Cargando...       │
│                         │
│                         │
│                         │
│                         │
│   v1.0.0                │
└─────────────────────────┘
```

**Notas:**
- Duración: ~2 s mientras se verifica el token JWT en SecureStore.
- Si hay token válido → redirige a Home.
- Si no hay token → redirige a Bienvenida.

---

## WF-01-02 · Pantalla de Bienvenida (Onboarding)

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│                         │
│   ░░░░░░░░░░░░░░░░░░░   │
│   ░  Ilustración App  ░ │
│   ░░░░░░░░░░░░░░░░░░░   │
│                         │
│  ● Ahorra en tu compra  │
│  Compara precios entre  │
│  supermercados y         │
│  comercios locales.     │
│                         │
│     [● ○ ○]             │
│                         │
│  ┌─────────────────┐    │
│  │  Crear cuenta   │    │
│  └─────────────────┘    │
│                         │
│  ¿Ya tienes cuenta?     │
│     [Iniciar sesión]    │
│                         │
└─────────────────────────┘
```

**Notas:**
- Carrusel de 3 slides con ilustraciones: Ahorro / Optimización / Asistente IA.
- El indicador `[● ○ ○]` muestra el slide activo.
- Deslizar horizontalmente avanza slides.

---

## WF-01-03 · Login

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Volver                │
│─────────────────────────│
│                         │
│    🛒 BargAIn           │
│                         │
│  Inicia sesión          │
│                         │
│  Correo electrónico     │
│  [______________________│
│  ___________________]   │
│                         │
│  Contraseña             │
│  [______________________│
│  ___________________] 👁│
│                         │
│  [¿Olvidaste tu clave?] │
│                         │
│  ┌─────────────────┐    │
│  │  Iniciar sesión │    │
│  └─────────────────┘    │
│                         │
│  ────── o continúa ──── │
│                         │
│  ┌──────────────────┐   │
│  │  🇬 Google        │   │
│  └──────────────────┘   │
│                         │
│  ¿No tienes cuenta?     │
│  [Regístrate gratis]    │
└─────────────────────────┘
```

**Notas:**
- El ojo `👁` activa/desactiva la visibilidad de la contraseña.
- Validación inline: borde rojo + mensaje de error bajo el campo.
- El botón "Iniciar sesión" se desactiva si los campos están vacíos.
- En caso de error 401 → mensaje "Credenciales incorrectas" bajo el formulario.
- JWT almacenado en Expo SecureStore tras login exitoso.

---

## WF-01-04 · Login — Estado con error de validación

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Volver                │
│─────────────────────────│
│                         │
│    🛒 BargAIn           │
│                         │
│  Inicia sesión          │
│                         │
│  Correo electrónico     │
│ ┌────────────────────┐  │
│ │ usuario@ejem       │  │  ← Borde rojo
│ └────────────────────┘  │
│ ⚠ Introduce un email    │
│   válido                │
│                         │
│  Contraseña             │
│ ┌────────────────────┐  │
│ │ ••••••             │  │
│ └────────────────────┘  │
│                         │
│ ┌─────────────────────┐ │
│ │ ⚠ Credenciales      │ │  ← Toast/banner de error
│ │   incorrectas        │ │
│ └─────────────────────┘ │
│                         │
│  ┌─────────────────┐    │
│  │  Iniciar sesión │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## WF-01-05 · Registro

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Volver                │
│─────────────────────────│
│                         │
│  Crea tu cuenta         │
│  Es gratis y sin spam.  │
│                         │
│  Nombre                 │
│  [______________________]
│                         │
│  Apellidos              │
│  [______________________]
│                         │
│  Correo electrónico     │
│  [______________________]
│                         │
│  Contraseña             │
│  [__________________] 👁│
│  ██████░░ Media         │  ← Indicador de fortaleza
│                         │
│  Confirmar contraseña   │
│  [__________________] 👁│
│                         │
│  [✓] Acepto los         │
│      Términos de uso    │
│      y Política privac. │
│                         │
│  ┌─────────────────┐    │
│  │   Crear cuenta  │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

**Notas:**
- Indicador de fortaleza de contraseña: rojo (débil) / naranja (media) / verde (fuerte).
- El checkbox de términos es obligatorio para habilitar "Crear cuenta".
- Tras registro exitoso → pantalla de verificación de email.

---

## WF-01-06 · Verificación de Email

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│                         │
│                         │
│         📧              │
│                         │
│  Revisa tu correo       │
│                         │
│  Hemos enviado un       │
│  enlace de verificación │
│  a:                     │
│                         │
│  usuario@ejemplo.com    │
│                         │
│  Haz clic en el enlace  │
│  para activar tu cuenta.│
│                         │
│  ┌─────────────────┐    │
│  │ Reenviar correo │    │
│  └─────────────────┘    │
│                         │
│  [Volver al inicio]     │
│                         │
│                         │
└─────────────────────────┘
```

---

## WF-01-07 · Recuperar Contraseña

```
┌─────────────────────────┐
│ 09:41         ●●● ▶ 🔋 │
│─────────────────────────│
│ ← Volver                │
│─────────────────────────│
│                         │
│  Recuperar contraseña   │
│                         │
│  Introduce tu correo    │
│  y te enviaremos un     │
│  enlace para restablecer│
│  tu contraseña.         │
│                         │
│  Correo electrónico     │
│  [______________________]
│                         │
│  ┌─────────────────┐    │
│  │  Enviar enlace  │    │
│  └─────────────────┘    │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

**Notas:**
- Tras enviar → pantalla de confirmación similar a WF-01-06.
- El enlace del correo abre la app (deep link) con pantalla de nueva contraseña.

---

## Diagrama de flujo de autenticación

```
┌──────────┐     Token      ┌──────────┐
│  Splash  │────válido ────▶│   Home   │
└────┬─────┘                └──────────┘
     │ No token
     ▼
┌──────────────┐   [Login]  ┌──────────┐  ✓  ┌──────────┐
│ Bienvenida   │──────────▶│  Login   │────▶│   Home   │
└──────────────┘           └──────┬───┘     └──────────┘
     │ [Registrarse]             │ [¿Olvidaste?]
     ▼                           ▼
┌──────────┐    ✓   ┌────────────────────┐
│ Registro │───────▶│ Verif. Email       │
└──────────┘        └────────────────────┘
```
