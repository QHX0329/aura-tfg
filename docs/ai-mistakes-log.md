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

### [2026-03-11] — ERR-002 — Claude (claude-sonnet-4-6)

**Contexto:** Ejecución de la tarea F1-14 (Wireframes / Mockups de UI). El agente generó diseños de pantallas para la app BargAIn en una sesión previa.

**Error cometido:** Se entregaron wireframes de las pantallas principales de la app usando arte ASCII (caracteres `+`, `-`, `|`, `[`, `]`, `#`) en lugar de un formato visual renderizable.

**Causa raíz:** El agente no recibió instrucción explícita sobre el formato de salida y eligió por defecto texto plano, que es el formato más portable pero carece totalmente de utilidad visual para diseño de interfaz de usuario.

**Solución aplicada:** Se regeneraron los 10 mockups completos en un único archivo `docs/diagramas/ui-mockups/index.html` autocontenido (HTML + CSS + JS), con marco de móvil realista, sistema de diseño real (colores, tipografías, componentes), galería navegable por pestañas y panel informativo con los requisitos RF vinculados a cada pantalla.

**Prevención:** Antes de generar cualquier wireframe, mockup o diagrama de interfaz de usuario, verificar que el formato de salida sea uno de los siguientes:
- `HTML + CSS + JS` autocontenido, renderizable directamente en GitHub Pages o como fichero `.html`
- `PNG` o `SVG` generado programáticamente
- `PlantUML @startsalt` únicamente para wireframes de baja fidelidad muy simples y como borrador temporal, nunca como entregable final

**Nunca** usar arte ASCII para representar pantallas, componentes o flujos de UI, independientemente de si el usuario lo pide de forma ambigua ("diseña las pantallas", "haz un esquema de la UI", etc.). Si hay ambigüedad, preguntar el formato antes de implementar.

**Archivos afectados:** Ninguno (el error se detectó antes de que el fichero ASCII fuera comprometido al repositorio). Entregable correcto creado en `docs/diagramas/ui-mockups/index.html`.

---

## Patrones de error recurrentes

> Esta sección se actualiza automáticamente cuando un mismo tipo de error ocurre más de una vez.

*(Sin patrones recurrentes registrados aún)*

---

## Reglas derivadas de este log

> Reglas que todos los agentes deben seguir, extraídas de los errores anteriores.

**REGLA-01 (de ERR-001):** Antes de escribir en cualquier archivo de documentación, leerlo completamente. Si contiene contenido sustancial (>10 líneas útiles), no sobreescribir sin confirmación explícita del usuario.

**REGLA-02 (de ERR-002):** Los wireframes, mockups y diagramas de interfaz de usuario **nunca** se entregan en formato ASCII. El formato obligatorio es HTML+CSS+JS autocontenido (renderizable en GitHub), PNG/SVG generado programáticamente, o PlantUML `@startsalt` solo para borradores de muy baja fidelidad. Ante ambigüedad en el formato pedido, preguntar antes de implementar.

---

## Instrucciones para agentes

- **Claude:** Actualiza este archivo al final de cada sesión donde hayas cometido un error, aunque sea menor. Usa el formato estándar. Revisa las REGLAS derivadas al inicio de cada sesión.
- **Gemini / Codex:** Si detectas un error tuyo o de otro agente en los archivos del proyecto (código incorrecto, documentación contradictoria, etc.), añade una entrada aquí antes de corregirlo. Incluye "— Gemini" o "— Codex" en el encabezado.
- **Todos:** Si una REGLA de este log aplica a lo que estás a punto de hacer, menciónala explícitamente en tu razonamiento antes de actuar.
