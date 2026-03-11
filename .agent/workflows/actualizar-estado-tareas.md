---
description: Actualizar el estado de las tareas en Notion, GitHub y TASKS.md
---
# Procedimiento para actualizar el estado de las tareas

Este workflow sincroniza automáticamente el estado de las tareas tomando el archivo `TASKS.md` como **fuente de verdad**, y replicando los cambios hacia Notion y GitHub. Sigue estos pasos de forma estricta:

1. **Leer y Parsear TASKS.md:**
   Abre y lee el archivo `TASKS.md` en el repositorio para obtener el estado actual de todas las tareas.
   Busca e identifica las tablas de tareas de cada Fase y extrae para cada fila el `ID` (ej. F3-01) y su `Estado` actual (⬜, 🔄, 🔁, ✅, ❌). Compara este estado con lo que vayas a publicar para actualizar solo lo necesario.

2. **Actualizar Notion Backlog:**
   Utiliza las herramientas del servidor MCP de Notion (`notion-mcp-server`) para sincronizar el estado:
   - Usa `API-query-data-source` indicando en `data_source_id` la ID de la base de datos de Notion (`234f4ce235f74bf388c3892e44bd5667`) para buscar las páginas de las tareas (filtrando por el ID de la tarea).
   - Usa la herramienta `API-patch-page` para actualizar la propiedad de estado de las tareas que hayan cambiado o asegurar que están en sincronía.
   - Las correspondencias estrictas de estado son:
     - ⬜ Pendiente -> "Not started"
     - 🔄 En progreso -> "In progress"
     - 🔁 En revisión -> "In review"
     - ✅ Completada -> "Done"
     - ❌ Bloqueada -> "Blocked"
   *Nota: Si la herramienta MCP de Notion falla o no tienes permisos, resume los cambios que no pudiste hacer e informa al usuario para que los haga manualmente en URL: https://www.notion.so/234f4ce235f74bf388c3892e44bd5667*

3. **Actualizar GitHub Issues:**
   Utiliza las herramientas del servidor MCP de GitHub (`mcp_github-mcp-server`) para buscar y actualizar los issues en el repositorio `QHX0329/bargain-tfg`:
   - Para cada tarea sincronizada, usa `mcp_github-mcp-server_search_issues` con el query: `repo:QHX0329/bargain-tfg "{ID_TAREA}" in:title` (ejemplo: `"F3-01" in:title`) para localizar el `issue_number`.
   - Si una tarea figura como ✅ Completada en `TASKS.md`, usa `mcp_github-mcp-server_issue_write` indicando el `issue_number`, `state: "closed"` y `state_reason: "completed"`. De manera análoga, para reaperturas manda `state: "open"`.
   - Puedes emplear `mcp_github-mcp-server_add_issue_comment` para dejar un comentario en el issue (ej. "Estado de tarea sincronizado como Completado según TASKS.md").

4. **Commit de la actualización (Si corresponde):**
   Si como paso previo a esta sincronización tuviste que modificar `TASKS.md` por órdenes del usuario, crea un commit utilizando Conventional Commits: `chore(tasks): sincronizar estado de tareas con GitHub y Notion`.
