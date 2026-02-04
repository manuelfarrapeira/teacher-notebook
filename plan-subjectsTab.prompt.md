## Plan: Crear pestaña de Asignaturas con operaciones CRUD

Crear una nueva pestaña "Asignaturas" que permita listar, crear, modificar y eliminar asignaturas utilizando los nuevos endpoints API. La pestaña se ubicará después de "Clases" y seguirá los mismos patrones de las tabs existentes.

### Steps

1. **Crear servicio `SubjectService`** en [src/services/SubjectService.ts](src/services/SubjectService.ts) heredando de `BaseService`, con métodos:
   - `getSubjects(): Promise<Subject[]>` → GET `/teacher-notebook/v1/subjects/`
   - `createSubject(name: string): Promise<Subject>` → PUT `/teacher-notebook/v1/subjects`
   - `updateSubject(id: number, name: string): Promise<Subject>` → PATCH `/teacher-notebook/v1/subjects/{id}`
   - `deleteSubject(id: number): Promise<void>` → DELETE `/teacher-notebook/v1/subjects/{id}`

2. **Agregar traducciones para "subjects"** en [src/lib/i18n.tsx](src/lib/i18n.tsx):
   - `dashboard.tabs.subjects` ("Asignaturas" / "Subjects")
   - `dashboard.subjects.*` (title, addNew, name, namePlaceholder, edit, delete, deleteTitle, deleteConfirm, createSuccess, updateSuccess, deleteSuccess, createError, updateError, deleteError, loadError, noSubjects, validation.nameRequired, validation.nameMinLength)

3. **Crear componente `SubjectsTab`** en [src/components/tabs/SubjectsTab.tsx](src/components/tabs/SubjectsTab.tsx):
   - Lista de asignaturas con botones editar/eliminar
   - Formulario modal para crear/editar con validación (nombre mínimo 3 caracteres)
   - `ConfirmDeleteModal` para confirmar eliminación
   - Modales `ErrorModal` y `SuccessModal` para feedback
   - Usar clases CSS `dashboard-card`, `dashboard-section-header`, etc.
   - Icono `BookType` de lucide-react

4. **Registrar la nueva tab en Dashboard** en [src/components/Dashboard.tsx](src/components/Dashboard.tsx):
   - Importar `SubjectsTab` y `BookType`
   - Añadir `{ id: 'subjects', label: t('dashboard.tabs.subjects'), icon: BookType }` después de "classes" en el array `tabs`
   - Añadir case `'subjects'` que renderice `<SubjectsTab />`

5. **Registrar la tab en Sidebar** en [src/components/Sidebar.tsx](src/components/Sidebar.tsx):
   - Importar `BookType`
   - Añadir `{ id: 'subjects', label: t('dashboard.tabs.subjects'), icon: BookType }` después de "classes"

### Archivos a crear
- `src/services/SubjectService.ts`
- `src/components/tabs/SubjectsTab.tsx`

### Archivos a modificar
- `src/lib/i18n.tsx` (traducciones ES/EN)
- `src/components/Dashboard.tsx` (import + tabs + render)
- `src/components/Sidebar.tsx` (import + tabs)

