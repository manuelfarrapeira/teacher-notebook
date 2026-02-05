# Plan: Implementar pestaña Horario (ScheduleTab) con calendario escolar

Implementar la pestaña de Horario que muestra un calendario semanal (lunes a viernes) en formato tabla HTML con las asignaturas y sus horarios para la clase seleccionada. Permitirá agregar, modificar y eliminar franjas horarias usando modales. Se pasará `selectedClass` como prop igual que en `StudentsTab`.

## Steps

### 1. Crear `ScheduleService`
**Archivo:** `src/services/ScheduleService.ts`

Heredando de `BaseService`:
- Interface `ScheduleItem` con: `id`, `classId`, `subjectId`, `day` (1-5), `start`, `end`
- Interface `ScheduleItemRequest` con: `subjectId`, `start`, `end`
- Interface `ScheduleCreateRequest` con: `day`, `items[]`
- `getSchedules(classId)`: GET `/teacher-notebook/v1/classes/:class_id/schedules`
- `createSchedule(classId, day, items)`: PUT `/teacher-notebook/v1/classes/:class_id/schedules`
- `updateSchedule(scheduleId, data)`: PATCH `/teacher-notebook/v1/schedules/:schedule_id`
- `deleteSchedules(ids)`: DELETE `/teacher-notebook/v1/schedules` con body `{ ids: [] }`

### 2. Agregar traducciones
**Archivo:** `src/lib/i18n.tsx`

Bajo `dashboard.schedule`:
- Días: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`
- UI: `title`, `addEntry`, `editEntry`, `noClassSelected`, `noEntries`, `time`, `subject`, `start`, `end`, `day`
- Validaciones: `startRequired`, `endRequired`, `endAfterStart`, `subjectRequired`, `dayRequired`
- Mensajes: `createSuccess`, `updateSuccess`, `deleteSuccess`, `loadError`, `createError`, `updateError`, `deleteError`
- Confirmación: `deleteTitle`, `deleteConfirm`

### 3. Agregar estilos CSS
**Archivo:** `src/index.css`

Con prefijo `schedule-`:
- `.schedule-table`: tabla con bordes, 100% ancho
- `.schedule-header-cell`: celdas header de días (fondo azul claro)
- `.schedule-time-cell`: celdas de hora (fondo gris)
- `.schedule-cell`: celdas de contenido
- `.schedule-entry`: item de asignatura dentro de celda (con botones hover)
- `.schedule-entry-actions`: contenedor de botones editar/eliminar
- `.schedule-no-class`: mensaje cuando no hay clase seleccionada

### 4. Actualizar `Dashboard.tsx`
**Archivo:** `src/components/Dashboard.tsx`

Pasar props a `ScheduleTab`:
```tsx
{activeTab === 'schedule' && (
  <ScheduleTab selectedClass={selectedClass} />
)}
```

### 5. Desarrollar `ScheduleTab`
**Archivo:** `src/components/tabs/ScheduleTab.tsx`

- Props: `selectedClass: number | null`
- Cargar `subjects` con `SubjectService.getSubjects()` y `schedules` con `ScheduleService.getSchedules(classId)`
- Renderizar tabla HTML semántica con `<table>`, `<thead>`, `<tbody>`
- Columnas: Hora | Lunes | Martes | Miércoles | Jueves | Viernes
- Agrupar entradas por hora y mostrar en celdas correspondientes
- Botón "Añadir" en header para abrir modal de creación
- Mostrar estado vacío si no hay clase seleccionada
- Iconos de editar/eliminar con estilo consistente (usar misma estética que SubjectsTab)

### 6. Implementar modal de formulario
**Opción:** Inline en `ScheduleTab` o crear `src/components/modals/ScheduleFormModal.tsx`

- Campos: 
  - Selector de día (1-5) como dropdown
  - Selector de asignatura (dropdown con subjects)
  - Hora inicio (input type="time")
  - Hora fin (input type="time")
- Validar que hora fin > hora inicio
- Modo crear: llamar `ScheduleService.createSchedule`
- Modo editar: llamar `ScheduleService.updateSchedule`

### 7. Implementar eliminación
- Usar `ConfirmDeleteModal` existente antes de eliminar
- Llamar `ScheduleService.deleteSchedules([id])`
- Mostrar `SuccessModal`/`ErrorModal` según resultado

## API Endpoints Reference

### GET `/teacher-notebook/v1/classes/:class_id/schedules`
Respuesta:
```json
[
  {
    "id": 1,
    "classId": 1,
    "subjectId": 1,
    "day": 1,
    "start": "08:30",
    "end": "09:30"
  }
]
```

### PUT `/teacher-notebook/v1/classes/:class_id/schedules`
Request body:
```json
{
  "day": 1,
  "items": [
    {
      "subjectId": 3,
      "start": "10:30",
      "end": "11:30"
    }
  ]
}
```

### PATCH `/teacher-notebook/v1/schedules/:schedule_id`
Request body:
```json
{
  "day": 1,
  "start": "10:30",
  "end": "11:15"
}
```

### DELETE `/teacher-notebook/v1/schedules`
Request body:
```json
{
  "ids": [1, 3]
}
```

## Consideraciones

- Los días van de 1 a 5 correspondiendo a Lunes-Viernes
- El `class_id` se obtiene de la clase seleccionada en la barra superior
- Si no hay clase seleccionada, mostrar mensaje indicativo y deshabilitar funcionalidad
- Mantener consistencia visual con el resto de tabs (SubjectsTab, ClassesTab)
- Usar `localStorage` para persistir preferencias si es necesario

