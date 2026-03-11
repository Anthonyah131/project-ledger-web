# Informe QA - Modulo de Metodos de Pago

Fecha: 2026-03-10  
Entorno: Local (http://localhost:3000)  
Navegador de prueba: MCP DevTools (snapshot + network + console)

## Alcance probado

- http://localhost:3000/payment-methods
- http://localhost:3000/payment-methods/849f3091-e3a3-48c6-8afc-24289b7575d8

## Cobertura funcional ejecutada

1. Listado de metodos de pago (/payment-methods)
- Carga de listado: OK
- Conteo de metodos: OK
- Busqueda con estado vacio: OK
- Filtro por tipo (Todos/Banco/Tarjeta/Efectivo): OK
- Cambio de vista (cuadricula/lista): OK

2. CRUD en listado
- Crear metodo: OK
- Validacion de requerido (Nombre): OK
- Editar metodo: OK
- Eliminar metodo (desactivacion): OK
- Limpieza de datos de prueba al finalizar: OK

3. Detalle de metodo (/payment-methods/{id})
- Carga de cabecera y resumen: OK
- Tabs (Pagos relacionados / Ingresos relacionados / Proyectos): OK
- Filtro por proyecto en pagos/ingresos: OK
- Boton Limpiar filtros: OK
- Acciones del metodo (Editar, Eliminar): OK (sin confirmar eliminacion)

## Hallazgos para mejoras futuras

### PM-IMP-01 (Media) - Accesibilidad de formularios

Descripcion:
- En consola se reportan issues de campos de formulario sin id o name.
- Tambien se observaron campos sin autocomplete en el modulo de listado.

Evidencia:
- Issue: A form field element should have an id or name attribute
- Issue: An element doesn't have an autocomplete attribute

Recomendacion:
- Estandarizar componentes de formulario para exigir id, name, label asociado y autocomplete cuando aplique.

### PM-IMP-02 (Media) - Warnings de foco/aria-hidden en dropdowns y dialogs

Descripcion:
- Se repiten warnings al abrir/cerrar menus y modales por conflicto entre foco activo y aria-hidden.

Evidencia:
- Warning: Blocked aria-hidden on an element because its descendant retained focus

Recomendacion:
- Revisar gestion de foco en overlays (Dropdown/Dialog/Popover), priorizando inert/focus trap consistente y retorno de foco al trigger.

### PM-IMP-03 (Baja) - Boton de acciones en cabecera de detalle sin etiqueta visible clara

Descripcion:
- En la vista detalle, el boton de acciones junto al titulo aparece sin nombre accesible visible en el snapshot.

Impacto:
- Reduce claridad para usuarios y herramientas de accesibilidad/automatizacion.

Recomendacion:
- Agregar aria-label explicito (por ejemplo: "Acciones del metodo de pago") y/o texto tooltip consistente.

### PM-IMP-04 (Baja) - UX de filtro de fechas requiere verificacion de navegacion por teclado

Descripcion:
- Durante la prueba asistida por MCP, la edicion manual por teclado en el rango de fechas mostro comportamiento sensible al foco.

Nota:
- Esto puede depender del mecanismo de automatizacion, por lo que se recomienda validarlo adicionalmente con prueba manual directa y E2E.

Recomendacion:
- Agregar casos de prueba E2E para tab order, ingreso manual de fecha y consistencia de valores dia/mes/anio.

### PM-IMP-05 (Baja) - Multiples requests en recarga en entorno dev

Descripcion:
- Se observan varias llamadas repetidas tras reload en entorno local dev.

Nota:
- Puede estar asociado a comportamiento esperado de desarrollo (Strict Mode / HMR).

Recomendacion:
- Confirmar en build de produccion si hay duplicacion real; si persiste, deduplicar consultas en hooks/capa de datos.

## Resumen tecnico

- API del modulo respondio correctamente en los flujos ejercitados (2xx/204, sin 4xx/5xx en esta corrida).
- No se detectaron bloqueos funcionales en los dos endpoints probados.
- Quedan mejoras de accesibilidad y robustez UX para priorizar en siguientes iteraciones.
