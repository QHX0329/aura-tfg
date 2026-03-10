# AI Mistakes Log — BargAIn

> Registro de errores cometidos por agentes IA trabajando en este proyecto,
> con su causa raíz y solución. Actualizar este archivo cada vez que se detecte
> un error cometido por un agente IA (Claude, Gemini, Codex u otro).
>
> **Propósito:** Mejorar la eficacia de futuros agentes evitando errores repetidos.
> **Referenciado desde:** `CLAUDE.md`, `TASKS.md`

---

## Formato de entrada

```
### [YYYY-MM-DD] — [CÓDIGO_ERROR] — [AGENTE]

**Contexto:** Qué se estaba haciendo cuando ocurrió el error.
**Error cometido:** Descripción exacta del fallo.
**Causa raíz:** Por qué ocurrió (falta de contexto, suposición incorrecta, etc.).
**Solución aplicada:** Cómo se corrigió.
**Prevención:** Qué comprobar antes de hacer esto en el futuro.
**Archivos afectados:** Lista de archivos modificados incorrectamente.
```

---

## Errores registrados

### [2026-03-10] — ERR-001 — Claude (claude-sonnet-4-6)

**Contexto:** Redacción de la sección 8 de la memoria del TFG (Diseño e Implementación).

**Error cometido:** Se asumió que la sección 08 estaba vacía sin verificar si existía contenido previo significativo más allá del stub de "Pendiente de desarrollo".

**Causa raíz:** Confianza excesiva en el estado inicial del archivo; no se comprobó si había trabajo previo del usuario antes de sobreescribir.

**Solución aplicada:** Se leyó el archivo antes de escribir y se confirmó que solo contenía el stub de placeholder. La sobreescritura fue correcta en este caso.

**Prevención:** Siempre leer el archivo destino antes de escribir. Si contiene más de un stub de 5 líneas, preguntar al usuario si quiere conservar o reemplazar el contenido.

**Archivos afectados:** `docs/memoria/08-diseno-implementacion.md`

---

## Patrones de error recurrentes

> Esta sección se actualiza automáticamente cuando un mismo tipo de error ocurre más de una vez.

*(Sin patrones recurrentes registrados aún)*

---

## Reglas derivadas de este log

> Reglas que todos los agentes deben seguir, extraídas de los errores anteriores.

**REGLA-01 (de ERR-001):** Antes de escribir en cualquier archivo de documentación, leerlo completamente. Si contiene contenido sustancial (>10 líneas útiles), no sobreescribir sin confirmación explícita del usuario.

---

## Instrucciones para agentes

- **Claude:** Actualiza este archivo al final de cada sesión donde hayas cometido un error, aunque sea menor. Usa el formato estándar. Revisa las REGLAS derivadas al inicio de cada sesión.
- **Gemini / Codex:** Si detectas un error tuyo o de otro agente en los archivos del proyecto (código incorrecto, documentación contradictoria, etc.), añade una entrada aquí antes de corregirlo. Incluye "— Gemini" o "— Codex" en el encabezado.
- **Todos:** Si una REGLA de este log aplica a lo que estás a punto de hacer, menciónala explícitamente en tu razonamiento antes de actuar.
