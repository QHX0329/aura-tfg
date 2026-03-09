# 2. Definición de Objetivos del Proyecto

## Objetivo Principal

Desarrollar una aplicación móvil y web que optimice la compra diaria del usuario, calculando la combinación de supermercados y comercios locales que ofrece la mejor relación Precio–Distancia–Tiempo, integrando web scraping, algoritmos de optimización geoespacial, visión artificial y un asistente conversacional basado en LLM.

## Objetivos Específicos

1. **Diseñar e implementar un sistema de ingesta de precios** que combine web scraping automatizado de las principales cadenas de supermercados en España (Mercadona, Carrefour, Lidl, DIA, Alcampo) con un sistema de crowdsourcing que permita a usuarios y comercios actualizar datos en tiempo real.

2. **Desarrollar un algoritmo de optimización multicriterio** que, dada una lista de la compra y la ubicación del usuario, genere la ruta óptima de compra ponderando precio, distancia geográfica (PostGIS) y tiempo estimado de recorrido, limitando las paradas a un máximo configurable.

3. **Implementar un módulo de visión artificial (OCR)** capaz de procesar fotografías de listas de compra escritas a mano y tickets de compra anteriores, reconociendo los productos y añadiéndolos automáticamente a la lista digital del usuario.

4. **Integrar un asistente conversacional basado en LLM** (Claude API) que permita al usuario realizar consultas complejas en lenguaje natural relacionadas con su compra, como "¿Dónde comprar los ingredientes para una paella para 10 personas al mejor precio en un radio de 5 km?".

5. **Crear un portal de gestión para PYMES y comercio local** que permita a pequeños comercios posicionar sus productos y ofertas en igualdad de condiciones técnicas frente a las grandes cadenas, fomentando la inclusión del comercio de proximidad.

6. **Diseñar una API RESTful completa** con Django REST Framework, documentada con OpenAPI/Swagger, que sirva como backend tanto para la aplicación móvil (React Native) como para el portal web.

7. **Garantizar la calidad del software** mediante una cobertura de tests unitarios superior al 80%, tests de integración para los flujos principales y pruebas de usabilidad con usuarios reales.

8. **Desplegar la aplicación en un entorno de staging** con CI/CD automatizado mediante GitHub Actions, Docker y Render, documentando el proceso para facilitar la escalabilidad futura.

9. **Documentar el proceso completo** de ingeniería del software: desde el análisis de requisitos hasta las pruebas, siguiendo las buenas prácticas de la disciplina y los estándares de la ETSII de la Universidad de Sevilla.

10. **Validar la usabilidad** de la aplicación mediante pruebas con al menos 5 usuarios reales en diferentes dispositivos, midiendo la satisfacción y detectando puntos de mejora.

## Indicadores de Éxito

| Indicador | Meta |
|-----------|------|
| Cobertura de tests backend | ≥ 80% |
| Tiempo de respuesta API (p95) | < 500ms |
| Precisión del OCR en listas manuscritas | ≥ 75% |
| Ahorro medio calculado por ruta optimizada | > 5% vs compra en un solo supermercado |
| Satisfacción de usuarios en pruebas | ≥ 4/5 |
| Disponibilidad del sistema en staging | ≥ 99% |
