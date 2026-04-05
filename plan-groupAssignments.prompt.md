## Plan: Group Assignments in Cooperative Tab

Add a "Group Assignments" section to the existing `CooperativeTab` allowing teachers to create cooperative work assignments per class, manage assignment/group documents, and assign grades (0–10) to each group. A new `GroupAssignmentService` handles all API calls; a new domain model file defines the types; a new modal manages documents; and i18n keys cover both languages.

### Steps

1. **Create domain model** `src/domain/models/GroupAssignment.ts` and export from `src/domain/models/index.ts`.
   - `GroupAssignmentDocument` — `{ id, document, description, groupDocument }`.
   - `GroupAssignmentGrade` — `{ id, groupAssignmentId, groupId, grade, groupName, documents: GroupAssignmentDocument[] }`.
   - `GroupAssignment` — `{ id, classId, title, description, quarter, documents: GroupAssignmentDocument[] }`.
   - `GroupAssignmentRequest` — `{ title, description?, quarter }`.

2. **Create service** `src/infrastructure/api/GroupAssignmentService.ts` extending `BaseService`, register in `src/infrastructure/api/index.ts`.
   - `getByClass(classId)` → GET `/classes/:classId/group-assignments`
   - `create(classId, data)` → POST `/classes/:classId/group-assignments`
   - `update(assignmentId, data)` → PATCH `/group-assignments/:assignmentId`
   - `deleteAssignment(assignmentId)` → DELETE `/group-assignments/:assignmentId`
   - `getGrades(assignmentId)` → GET `/group-assignments/:assignmentId/grades`
   - `upsertGrade(assignmentId, groupId, grade)` → PUT `/group-assignments/:assignmentId/groups/:groupId/grade` body `{ grade }`
   - `deleteGrade(assignmentId, groupId)` → DELETE `/group-assignments/:assignmentId/groups/:groupId/grade`
   - `uploadAssignmentDoc(assignmentId, file, desc)` → POST FormData `/group-assignments/:assignmentId/documents`
   - `uploadGroupDoc(assignmentId, groupId, file, desc)` → POST FormData `/group-assignments/:assignmentId/groups/:groupId/documents`
   - `downloadDoc(assignmentId, documentId)` → GET Blob `/group-assignments/:assignmentId/documents/:documentId/download`
   - `deleteDoc(assignmentId, documentId)` → DELETE `/group-assignments/:assignmentId/documents/:documentId`

3. **Create modal** `src/components/modals/GroupAssignmentDocumentsModal.tsx`.
   - Follows the pattern of `GradeDocumentsModal.tsx`: list documents, upload (file + description, max 2 MB), download, delete with `ConfirmDeleteModal`.
   - Receives `assignmentId`, `groupId?` (null → assignment-level doc, present → group-level doc), `documents[]`, `onDocumentsChanged`.
   - Calls `GroupAssignmentService.uploadAssignmentDoc` or `.uploadGroupDoc` depending on `groupId`.
   - Uses `PortalTooltip` for action buttons. Inner scroll on `modal-content`, `<dialog>` element.

4. **Create modal** `src/components/modals/GroupAssignmentFormModal.tsx`.
   - Form for creating/editing: `title` (required), `description` (optional), `quarter` custom dropdown 1–3 (required).
   - Custom dropdown (`.shape-dropdown-trigger` / `.selector-dropdown`) for quarter — **no native `<select>`**.
   - Validation with `input-error`, `form-error-text`, focus-first-error. On save → `GroupAssignmentService.create` or `.update`, then `onSaved` callback.

5. **Extend `CooperativeTab.tsx`** with a new section below groups.
   - Section header "Trabajos cooperativos" with "Add" button (disabled if no saved groups).
   - List assignments as cards showing: title, quarter badge, description, assignment-docs icon/count.
   - Per card: edit, delete, assignment-documents buttons.
   - **Grades sub-section per assignment** (expandable/collapsible): one row per saved group with group name, grade input (`type="text"`, `inputMode="numeric"`, 0–10), save/delete grade buttons, group-documents icon.
   - After each mutation call `fetchAssignments()` to refresh all data.

6. **Add i18n keys** in `src/lib/i18n.tsx` — type interface + ES + EN.
   - New `groupAssignments` sub-object: `title`, `addAssignment`, `editAssignment`, `deleteAssignment`, `deleteAssignmentConfirm`, `assignmentTitle`, `assignmentTitlePlaceholder`, `assignmentDescription`, `assignmentDescriptionPlaceholder`, `quarter`, `grades`, `grade`, `gradePlaceholder`, `gradeRange`, `saveGrade`, `deleteGrade`, `documents`, `assignmentDocuments`, `groupDocuments`, `noDocuments`, `uploadDocument`, `downloadDocument`, `deleteDocument`, `deleteDocumentConfirm`, `noAssignments`, `noAssignmentsHint`, `needSavedGroups`, `createSuccess`, `updateSuccess`, `deleteSuccess`, `createError`, `updateError`, `deleteError`, `gradeSuccess`, `gradeError`, `gradeDeleteSuccess`, `gradeDeleteError`, `loadError`, `validation.titleRequired`, `validation.quarterRequired`, `validation.gradeRange`.

7. **Add CSS** in `src/index.css` (in the cooperative section, before the responsive block).
   - `.cooperative-assignments-section` — margin-top separator with border-top.
   - `.cooperative-assignment-card` — white bg, border, border-radius, padding.
   - `.cooperative-assignment-header` — flex row: title, quarter badge, action buttons.
   - `.cooperative-assignment-actions` — flex row for edit/delete/docs buttons.
   - `.cooperative-grade-row` — flex row per group: group name, grade input, buttons.
   - `.cooperative-quarter-badge` — small colored pill (different color per quarter).
   - `.cooperative-grade-input` — small numeric input styled to match project palette.
   - Responsive `@media (max-width: 768px)` stacking rules.

8. **Update `README.md`** with the new Group Assignments feature under the Cooperative section.

### Further Considerations

1. **Quarter dropdown** must use the custom dropdown pattern (`.shape-dropdown-trigger` / `.selector-dropdown`) — no native `<select>`, per project conventions.
2. **Grade validation**: filter non-numeric/non-dot chars in real-time with `replaceAll`; clamp 0–10; show `input-error` if out of range — per project form validation rules.
3. **If no saved groups exist**, the assignments section should display a hint message instead of grades, since grades reference saved group IDs.

