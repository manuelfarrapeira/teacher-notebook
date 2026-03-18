## Plan: Nueva pestaña "Rúbricas" en sección Alumnos

Crear una sub-pestaña "Rúbricas" dentro de `StudentsTab`, después de "Criterios de evaluación". Muestra una tabla tipo spreadsheet: filas = alumnos de la clase, columnas = rúbricas asignadas a la clase filtradas por competencia seleccionada. Cada celda muestra el criterio asignado al alumno (rango de nota + tooltip con descripción) o un botón para asignar uno mediante un modal pequeño. Incluye combo de competencias, botón para gestionar rúbricas asignadas a la clase, y operaciones crear/eliminar criterio por alumno.

---

### Step 1 — Crear servicio `ClassRubricService.ts`

**Archivo:** `src/services/ClassRubricService.ts`

Hereda de `BaseService`. Define interfaces basadas en las respuestas reales confirmadas:

**Interfaces:**

```ts
ClassRubricCriterion { id: number; description: string; gradeStart: number; gradeEnd: number; }

ClassRubric { id: number; classId: number; rubricId: number; rubricTitle: string; skillId: number; criteria: ClassRubricCriterion[]; }

StudentCriterionAssignment { id: number; classRubricId: number; rubric: { id: number; title: string }; criterion: { id: number; description: string; gradeStart: number; gradeEnd: number }; }

StudentCriteriaGroup { student: { id: number; name: string; surnames: string }; rubricCriteria: StudentCriterionAssignment[]; }
```

**Métodos (8):**

| Método | HTTP | Endpoint |
|---|---|---|
| `getClassRubrics(classId)` | GET | `/classes/:classId/rubrics` → `ClassRubric[]` |
| `assignRubricToClass(classId, rubricId)` | POST (fetch manual) | `/classes/:classId/rubrics` body `{ rubricId }` |
| `removeRubricFromClass(classRubricId)` | DELETE | `/class-rubrics/:classRubricId` |
| `getAllStudentCriteria(classId)` | GET | `/classes/:classId/rubric-criteria` → `StudentCriteriaGroup[]` |
| `getStudentCriteria(classId, studentId)` | GET | `/classes/:classId/students/:studentId/rubric-criteria` |
| `assignCriterionToStudent(classRubricId, studentId, criterionId)` | POST (fetch manual) | `/class-rubrics/:classRubricId/students/:studentId/criteria` body `{ criterionId }` |
| `updateStudentCriterion(id, criterionId)` | PUT (heredado) | `/student-criteria/:id` body `{ criterionId }` |
| `removeStudentCriterion(id)` | DELETE (heredado) | `/student-criteria/:id` |

Los POST se implementan con `fetch` manual (mismo patrón que `AbsenceService.createAbsence`). Los GET/PUT/DELETE usan los métodos heredados de `BaseService`.

---

### Step 2 — Crear componente `ClassRubricsTab.tsx`

**Archivo:** `src/components/tabs/ClassRubricsTab.tsx`

**Props:** `{ selectedClass: number | null }`

**Estructura del componente:**

1. **Datos a cargar (con `useCallback` + `useEffect`):**
   - Competencias: `SkillService.getSkills()` → para el combo selector
   - Rúbricas de la clase: `ClassRubricService.getClassRubrics(classId)` → para columnas
   - Alumnos de la clase: `StudentService.getStudents()` filtrados por `classIds.includes(classId)`
   - Criterios asignados: `ClassRubricService.getAllStudentCriteria(classId)` → para celdas

2. **Toolbar** (clase CSS `class-rubrics-toolbar`):
   - Combo `<select>` de competencias (`class-rubrics-skill-select`): lista todas las competencias, al cambiar filtra las rúbricas por `skillId`
   - Botón "Gestionar Rúbricas" (`dashboard-add-btn`): abre modal para asignar/desasignar rúbricas de la competencia seleccionada

3. **Tabla** (misma estructura visual que `EvalCriteriaTab`):
   - Contenedor: `class-rubrics-table-container` > `class-rubrics-table-wrapper` (scroll lateral)
   - Tabla: `class-rubrics-table`
   - **Columna sticky** de alumnos: `class-rubrics-student-col` con `box-shadow`, `width: 1px` (shrink-to-fit), numerados `1. Apellidos, Nombre`
   - **Columnas** = rúbricas filtradas por la competencia seleccionada. Header muestra `rubricTitle`
   - **Celdas**: si el alumno tiene criterio asignado para esa rúbrica (matchear por `classRubricId`), mostrar `gradeStart–gradeEnd` con icono `Info` (tooltip portal con la descripción del criterio) + botón `Trash` para eliminar. Si no tiene criterio, mostrar botón `Plus` que abre un **modal pequeño** listando los criterios disponibles de esa rúbrica
   - Zebra striping filas pares/impares
   - Row hover highlight (mismo patrón que `eval-criteria`)

4. **Modal de selección de criterio** (se renderiza inline en el componente):
   - `<dialog>` con lista de criterios disponibles de la rúbrica
   - Cada criterio muestra: badge con rango `gradeStart–gradeEnd` + descripción
   - Al hacer clic, llama a `ClassRubricService.assignCriterionToStudent(classRubricId, studentId, criterionId)` y refresca datos
   - Botón cancelar para cerrar

5. **Modal de gestión de rúbricas de clase** (inline `<dialog>`):
   - Lista rúbricas de la competencia seleccionada (via `SkillRubricService.getRubrics(skillId)`)
   - Cada rúbrica muestra título + botón asignar/desasignar
   - Si ya está asignada a la clase (existe en `classRubrics` con mismo `rubricId`), botón rojo para desasignar con `ConfirmDeleteModal`
   - Si no está asignada, botón verde para asignar
   - Al asignar/desasignar, refrescar `classRubrics`

6. **Estados de vacío:**
   - Sin clase seleccionada: mensaje con `t('dashboard.classRubrics.noClassSelected')`
   - Sin competencias: mensaje informativo
   - Sin rúbricas para la competencia seleccionada: mensaje informativo

7. **Modales de feedback**: reutilizar `ErrorModal`, `SuccessModal`, `ConfirmDeleteModal`

---

### Step 3 — Actualizar `StudentsTab.tsx`

**Archivo:** `src/components/tabs/StudentsTab.tsx`

- Importar `ClassRubricsTab` desde `./ClassRubricsTab`
- Ampliar tipo `activeSubTab`: `'all' | 'class' | 'evalCriteria' | 'classRubrics' | 'attendance'`
- Añadir botón de pestaña **después de** `evalCriteria` y **antes de** `attendance`:
  ```tsx
  <button className={activeSubTab === 'classRubrics' ? 'active' : ''}
          onClick={() => setActiveSubTab('classRubrics')}>
    {t('dashboard.classRubrics.title')}
  </button>
  ```
- Renderizar: `{activeSubTab === 'classRubrics' && <ClassRubricsTab selectedClass={selectedClass} />}`

---

### Step 4 — Añadir traducciones en `i18n.tsx`

**Archivo:** `src/lib/i18n.tsx`

Añadir sección `dashboard.classRubrics` en el tipo `Translations` y en ambos idiomas:

**Claves necesarias (ES / EN):**

| Clave | ES | EN |
|---|---|---|
| `title` | Rúbricas | Rubrics |
| `selectSkill` | Competencia | Skill |
| `manageClassRubrics` | Gestionar Rúbricas | Manage Rubrics |
| `assignRubric` | Asignar Rúbrica | Assign Rubric |
| `removeRubric` | Desasignar Rúbrica | Remove Rubric |
| `noClassSelected` | Selecciona una clase para ver las rúbricas | Select a class to view rubrics |
| `noSkills` | No hay competencias registradas | No skills registered |
| `noRubricsForSkill` | No hay rúbricas asignadas para esta competencia | No rubrics assigned for this skill |
| `noStudentsInClass` | No hay alumnos en esta clase | No students in this class |
| `assignCriterion` | Asignar Criterio | Assign Criterion |
| `removeCriterion` | Eliminar Criterio | Remove Criterion |
| `removeCriterionTitle` | Eliminar criterio | Remove criterion |
| `removeCriterionConfirm` | ¿Está seguro que desea eliminar el criterio de este alumno? | Are you sure you want to remove this student's criterion? |
| `removeRubricTitle` | Desasignar rúbrica | Remove rubric |
| `removeRubricConfirm` | ¿Está seguro que desea desasignar la rúbrica "{name}"? Se eliminarán los criterios asignados a los alumnos. | Are you sure you want to remove the rubric "{name}"? Student criteria will be deleted. |
| `assignSuccess` | Criterio asignado correctamente | Criterion assigned successfully |
| `assignError` | Error al asignar el criterio | Error assigning criterion |
| `removeSuccess` | Criterio eliminado correctamente | Criterion removed successfully |
| `removeError` | Error al eliminar el criterio | Error removing criterion |
| `rubricAssignSuccess` | Rúbrica asignada a la clase | Rubric assigned to class |
| `rubricAssignError` | Error al asignar la rúbrica | Error assigning rubric |
| `rubricRemoveSuccess` | Rúbrica desasignada de la clase | Rubric removed from class |
| `rubricRemoveError` | Error al desasignar la rúbrica | Error removing rubric |
| `loadError` | Error al cargar las rúbricas | Error loading rubrics |
| `selectCriterion` | Seleccionar criterio | Select criterion |
| `noCriteriaAvailable` | No hay criterios disponibles para esta rúbrica | No criteria available for this rubric |
| `availableRubrics` | Rúbricas disponibles | Available rubrics |
| `assigned` | Asignada | Assigned |
| `notAssigned` | No asignada | Not assigned |
| `noCriterion` | Sin criterio | No criterion |

---

### Step 5 — Añadir estilos CSS en `index.css`

**Archivo:** `src/index.css` (al final)

Prefijo: `class-rubrics-`

**Clases a crear (siguiendo el patrón de `eval-criteria-*` y `attendance-*`):**

- `.class-rubrics-toolbar` — flex, align-items center, gap 0.75rem, margin-bottom 1rem, flex-wrap
- `.class-rubrics-skill-select` — mismo estilo que `eval-criteria-subject-select`
- `.class-rubrics-skill-select:focus` — outline none, border-color #624db6, box-shadow
- `.class-rubrics-table-container` — flex:1, position relative, flex-col, min-height:0
- `.class-rubrics-table-wrapper` — overflow-x/y auto, flex:1, min-height:0
- `.class-rubrics-table` — border-collapse separate, border-spacing 0, font-size 0.85rem, table-layout auto, width 100%, min-width 100%
- `.class-rubrics-table th, td` — padding 0.5rem 0.75rem, border 1px solid #e5e7eb, text-align center, white-space nowrap
- `.class-rubrics-table thead th` — background #f3f4f6, font-weight 600, color #374151, position sticky, top 0, z-index 1
- `.class-rubrics-student-col` — position sticky, left 0, z-index 2, background #f9fafb, width 1px, text-align left, font-weight 500, white-space nowrap, box-shadow 4px 0 8px -2px rgba(0,0,0,0.1)
- `.class-rubrics-table thead th.class-rubrics-student-col` — z-index 3, background #f3f4f6, text-align left
- `.class-rubrics-table tbody td.class-rubrics-student-col` — background #f9fafb, color #374151, font-size 0.83rem, text-align left
- Zebra striping: `tbody tr:nth-child(odd) td` #ffffff, `even` #f3f4f6; sticky col odd #f9fafb, even #eef0f3
- Row hover: `tbody tr:hover td` background #ede9fe, border-top/bottom 1.5px solid #624db6; `:first-child` border-left; `:last-child` border-right; student-col #e0dbf5
- `.class-rubrics-criterion-cell` — display flex, align-items center, justify-content center, gap 0.25rem
- `.class-rubrics-grade-badge` — inline-flex, align-items center, justify-content center, background #624db6, color #fff, font-weight 600, font-size 0.75rem, padding 0.2rem 0.6rem, border-radius 999px, white-space nowrap, flex-shrink 0, min-width 50px
- `.class-rubrics-criterion-actions` — display flex, gap 0.15rem
- `.class-rubrics-criterion-btn` — padding 0.15rem, background none, border none, cursor pointer, color #9ca3af, transition color 0.2s, display inline-flex, align-items center
- `.class-rubrics-criterion-btn:hover` — color #624db6
- `.class-rubrics-criterion-btn.delete:hover` — color #dc2626
- `.class-rubrics-add-criterion-btn` — padding 0.25rem 0.5rem, background #f3f4f6, border 1px dashed #d1d5db, cursor pointer, color #9ca3af, font-size 0.8rem, transition all 0.2s, display inline-flex, align-items center, justify-content center
- `.class-rubrics-add-criterion-btn:hover` — background #eff6ff, border-color #624db6, color #624db6
- `.class-rubrics-tooltip-trigger` — display inline-flex, align-items center, color #9ca3af, cursor default, transition color 0.2s
- `.class-rubrics-tooltip-trigger:hover` — color #624db6
- `.class-rubrics-tooltip-popup` — position fixed, background #1f2937, color #f9fafb, font-size 0.82rem, font-weight 400, line-height 1.5, padding 0.6rem 0.85rem, border-radius 8px, box-shadow 0 4px 16px rgba(0,0,0,0.25), white-space pre-wrap, max-width 280px, min-width 120px, width max-content, text-align center, pointer-events none, z-index 99999, animation class-rubrics-tooltip-fade-in 0.15s ease
- `@keyframes class-rubrics-tooltip-fade-in` — from opacity 0, to opacity 1
- `.class-rubrics-manage-list` — display flex, flex-direction column, gap 0.5rem, max-height 400px, overflow-y auto
- `.class-rubrics-manage-item` — display flex, align-items center, justify-content space-between, padding 0.75rem, border 1px solid #e5e7eb, border-radius 6px, background #f9fafb
- `.class-rubrics-manage-item-title` — font-weight 500, font-size 0.9rem, color #374151
- `.class-rubrics-manage-item-badge` — font-size 0.75rem, padding 0.2rem 0.6rem, border-radius 999px
- `.class-rubrics-manage-item-badge.assigned` — background #dcfce7, color #16a34a
- `.class-rubrics-manage-item-badge.not-assigned` — background #f3f4f6, color #6b7280
- Responsive `@media (max-width: 768px)`: toolbar flex-direction column, skill-select min-width 100%

---

### Step 6 — Actualizar `README.md`

**Archivo:** `README.md`

- En la sección "✨ Características", añadir una nueva subsección **📋 Rúbricas de Clase** describiendo:
  - Tabla de rúbricas por competencia y clase
  - Asignación/desasignación de rúbricas de competencias a clases
  - Asignación de criterios de evaluación a alumnos por rúbrica
  - Visualización de rango de notas y descripción del criterio en tooltip
  - Selector de competencias para filtrar rúbricas
- En la sección "📁 Estructura del Proyecto":
  - Añadir `ClassRubricsTab.tsx` en la lista de tabs
  - Añadir `ClassRubricService.ts` en la lista de servicios
- En el árbol de "Arquitectura de Servicios", añadir `ClassRubricService` con su descripción

---

### Further Considerations

1. **Tooltip portal**: crear componente `ClassRubricsTooltip` interno (mismo patrón que `EvalCriteriaTooltip` de `EvalCriteriaTab.tsx`) usando clases `class-rubrics-tooltip-*` para independencia.

2. **Performance**: las 4 llamadas de datos (`getSkills`, `getClassRubrics`, `getStudents`, `getAllStudentCriteria`) se hacen en paralelo con `Promise.all` (patrón de `loadAll` en `EvalCriteriaTab`).

3. **Tipo `Translations`**: extender la interface (~línea 349–430 de `i18n.tsx`) con la nueva sección `classRubrics` para mantener tipado estricto.

4. **Respuesta GET `/classes/:classId/rubrics`**: devuelve `{ id (classRubricId), classId, rubricId, rubricTitle, skillId, criteria[] }`. El `id` es el `classRubricId` que se usa para asignar criterios a alumnos y para desasignar la rúbrica de la clase.

5. **Respuesta GET `/classes/:classId/rubric-criteria`**: devuelve array de `{ student: { id, name, surnames }, rubricCriteria: [{ id (studentCriterionId), classRubricId, rubric: { id, title }, criterion: { id, description, gradeStart, gradeEnd } }] }`. El `id` del item de `rubricCriteria` es el `studentCriterionId` que se usa para eliminar el criterio del alumno.

6. **Mapeo celda**: para cada celda (alumno × rúbrica), buscar en `studentCriteriaGroups` el grupo del alumno, y dentro de `rubricCriteria` el item cuyo `classRubricId` coincide con el `id` de la `ClassRubric` de esa columna.

