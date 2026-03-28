# ADR-010: Persistencia relacional de ruta óptima y estrategia lock screen en iOS

## Estado
Aceptado

## Fecha
2026-03-27

## Contexto

El flujo de optimización de ruta devolvía datos útiles al cliente, pero su reutilización dependía
solo de `route_data` y del estado en memoria del frontend. Al abandonar la pantalla, el usuario
perdía continuidad operativa y debía recalcular aunque la lista no hubiese cambiado.

Además, se requiere una experiencia de compra en bloqueo iOS con marcaje rápido de ítems.
En el stack actual (Expo managed), un panel de checklist nativo en pantalla bloqueada no es
alcanzable sin extensión nativa iOS (ActivityKit + Widget Extension).

## Decisión

1. Persistir la optimización en dos niveles:
- Snapshot JSON existente en `OptimizationResult.route_data` para lectura rápida y compatibilidad.
- Desglose relacional nuevo para analítica y trazabilidad:
  - `OptimizationRouteStop` (paradas por tienda y orden)
  - `OptimizationRouteStopItem` (ítems con producto/precio elegido y total de línea)

2. Exponer recuperación directa de la última ruta por lista:
- `GET /api/v1/optimize/?shopping_list_id={id}` devuelve la última optimización persistida.
- `POST /api/v1/optimize/` mantiene cálculo y recálculo bajo demanda.

3. Definir la estrategia de lock screen iOS:
- Objetivo: checklist interactivo real en bloqueo con checkboxes.
- Implementación objetivo: Live Activities (ActivityKit) con extensión nativa.
- Implementación actual (F5-16): fallback con notificación interactiva en bloqueo (acciones
  rápidas por ítem, límite operativo de acciones de iOS).
- Expo managed se mantiene para desarrollo actual; el checklist nativo avanzado queda
  condicionado a incorporar módulo iOS específico en fase posterior.

## Alternativas consideradas

| Alternativa | Ventajas | Inconvenientes |
| --- | --- | --- |
| Solo `route_data` JSON (estado previo) | Simple y rápida de serializar | Poca trazabilidad, consultas analíticas limitadas |
| Persistencia 100% relacional sin JSON | Integridad fuerte | Mayor complejidad de serialización y ruptura de compatibilidad |
| Modelo híbrido JSON + relacional (elegida) | Compatibilidad inmediata + analítica detallada | Duplicidad controlada de datos |
| Lock screen con notificaciones interactivas (implementada como fallback) | Menor coste y compatible con Expo | UX limitada: no checkbox visual nativa por ítem |
| Lock screen con Live Activities (elegida para objetivo) | UX nativa en iOS, estado en tiempo real | Requiere extensión nativa y pipeline iOS específico |

## Consecuencias

- La pantalla de ruta optimizada puede cargar automáticamente la última ruta guardada.
- Se incorpora botón de recálculo explícito sin perder contexto de la lista.
- El backend gana capacidades de auditoría por tienda y precio seleccionado.
- El requisito de lock screen queda cubierto con fallback funcional en iOS y con evolución
  planificada hacia Live Activities para checklist nativo completo.

## Impacto

- Backend: nuevos modelos del módulo optimizer + endpoint GET de recuperación.
- Frontend: carga automática de ruta persistida y recálculo desde la misma pantalla.
- Documentación/diagramas: actualización de ER, clases y secuencia de optimización.
