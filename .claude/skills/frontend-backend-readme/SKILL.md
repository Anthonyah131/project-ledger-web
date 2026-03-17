---
name: frontend-backend-readme
description: >
  Genera un README de integración backend al final de una conversación de desarrollo frontend.
  Úsalo SIEMPRE que el usuario diga frases como "genera el reporte para el backend", "crea el README de backend",
  "documenta los cambios para el back", "haz el informe para el backend", o cualquier variante.
  También úsalo si el usuario terminó cambios en el frontend (componentes, dashboards, APIs, datos consumidos)
  y pide documentar qué necesita el backend saber. No esperes que el usuario mencione explícitamente
  "skill" — si hay trabajo frontend terminado y se pide algún tipo de reporte o documentación para backend, usa esta skill.
---

# Skill: Frontend → Backend README Report

## Objetivo

Producir un **README técnico para desarrolladores backend** que explique con precisión qué cambió en el frontend, qué impacto tiene en la API, y qué acciones debe tomar el backend.

Este documento se genera **al final de una tarea o conversación**, después de que el frontend fue modificado.

---

## Proceso de Ejecución

### 1. Leer el contexto de la conversación

Antes de generar nada, analiza toda la conversación para extraer:

- ¿Qué componentes o páginas del frontend cambiaron?
- ¿Qué datos se dejaron de consumir?
- ¿Qué datos nuevos se necesitan?
- ¿Qué endpoints se usan, cuáles se dejaron de usar, cuáles hacen falta?
- ¿Hubo cambios de estructura (renombrado de campos, tipos de datos, paginación, etc.)?
- ¿Hay problemas de rendimiento o UX que dependan del backend?

No inventes cambios. Si no hay información suficiente, indica qué falta con `[POR CONFIRMAR]`.

---

### 2. Clasificar el impacto

Clasifica cada cambio en una de estas categorías:

| Categoría | Descripción |
|-----------|-------------|
| 🔴 Crítico | El frontend está roto o incompleto sin este cambio |
| 🟡 Importante | Mejora significativa, pero hay workaround temporal |
| 🟢 Opcional | Mejora de rendimiento o limpieza técnica |

---

### 3. Generar el README

Produce el documento siguiendo exactamente esta estructura:

```markdown
# Frontend → Backend Integration Report

> Generado el: [FECHA]
> Proyecto: [NOMBRE SI SE CONOCE]
> Autor frontend: [SI SE MENCIONA]

---

## Resumen Ejecutivo

[2-4 líneas: qué cambió en el frontend y cuál es el impacto general en el backend]

---

## Cambios en el Frontend

[Descripción clara de qué se modificó: componentes, páginas, flujos de datos, lógica eliminada, etc.]

---

## Datos Eliminados

Campos o estructuras que el frontend ya **no consume**. El backend puede considerar eliminarlos para limpiar la respuesta.

| Campo / Endpoint | Motivo de eliminación | Prioridad |
|------------------|-----------------------|-----------|
| `field_name`     | Ya no se renderiza    | 🟢 Opcional |

---

## Nuevos Requerimientos de Datos

Información que el frontend **ahora necesita** y que el backend debe proveer.

| Campo / Dato | Tipo esperado | Endpoint sugerido | Prioridad |
|--------------|---------------|-------------------|-----------|
| `field_name` | `string`      | `GET /resource`   | 🔴 Crítico |

---

## Cambios en la API

### Endpoints Nuevos

Para cada endpoint nuevo:

**`METHOD /ruta`**
- **Propósito:** [qué hace]
- **Request:**
```json
{ "ejemplo": "valor" }
```
- **Response esperada:**
```json
{ "campo": "valor" }
```
- **Prioridad:** 🔴 / 🟡 / 🟢

---

### Endpoints Modificados

**`METHOD /ruta`**
- **Cambio:** [qué debe cambiar y por qué]
- **Antes:** `{ "campo_viejo": "..." }`
- **Después:** `{ "campo_nuevo": "..." }`
- **Prioridad:** 🔴 / 🟡 / 🟢

---

### Endpoints Deprecados

| Endpoint | Motivo | Acción sugerida |
|----------|--------|-----------------|
| `GET /old-route` | Ya no se llama desde el frontend | Puede eliminarse tras confirmar con QA |

---

## Notas de Implementación

[Recomendaciones técnicas opcionales: optimizar queries, evitar joins innecesarios, cachear respuestas frecuentes, etc.]

---

## Preguntas Abiertas

[Lista de puntos que el backend debe confirmar o decidir. Usa `[POR CONFIRMAR]` si hay ambigüedad.]

- [ ] ¿Se puede eliminar el campo X de la respuesta del endpoint Y?
- [ ] ¿Existe un endpoint para Z o hay que crearlo?
```

---

## Reglas de Calidad

**Siempre:**
- Incluir ejemplos de payload reales (no genéricos como `"value": "string"`)
- Indicar prioridad en cada cambio
- Usar nombres de campo exactos si se mencionaron en la conversación
- Anotar `[POR CONFIRMAR]` donde haya ambigüedad

**Nunca:**
- Modificar código del frontend
- Inventar endpoints o cambios que no emergen de la conversación
- Usar lenguaje vago como "probablemente" o "tal vez debería"
- Repetir información innecesariamente

---

## Nombre del Archivo de Salida

Guardar como:

```
README_BACKEND_API_CHANGES.md
```

Presentar al usuario con `present_files` al finalizar.