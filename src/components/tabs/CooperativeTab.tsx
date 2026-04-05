import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Users, Shuffle, Save, Trash2, GripVertical, X, RefreshCw, Plus, Edit, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { StudentService, Student, Shape } from '../../infrastructure/api/StudentService';
import { StudentGroupService, SavedGroupRequest } from '../../infrastructure/api/StudentGroupService';
import { GroupAssignmentService } from '../../infrastructure/api/GroupAssignmentService';
import type { GroupAssignment, GroupAssignmentGrade, GroupAssignmentDocument } from '../../domain/models';
import { StudentPhoto } from '../students/StudentPhoto';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { GroupAssignmentFormModal } from '../modals/GroupAssignmentFormModal';
import { GroupAssignmentDocumentsModal } from '../modals/GroupAssignmentDocumentsModal';
import { PortalTooltip } from '../ui/PortalTooltip';

/**
 * Renders a small colored shape SVG inline for cooperative student items
 */
function renderShapeBadge(shape?: Shape): React.ReactNode {
  if (!shape) return null;
  const size = 18;
  if (shape === 'CIRCLE') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="cooperative-shape-icon">
        <circle cx="12" cy="12" r="9" fill="#ef4444" stroke="#000" strokeWidth="0.8"/>
      </svg>
    );
  }
  if (shape === 'TRIANGLE') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="cooperative-shape-icon">
        <polygon points="12,3 22,21 2,21" fill="#3b82f6" stroke="#000" strokeWidth="0.8" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (shape === 'SQUARE') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="cooperative-shape-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" stroke="#000" strokeWidth="0.8"/>
      </svg>
    );
  }
  return null;
}

/**
 * Props for CooperativeTab
 */
interface CooperativeTabProps {
  /** Currently selected class ID */
  readonly selectedClass: number | null;
}

/**
 * Internal representation of a group for local editing
 */
interface LocalGroup {
  /** Persisted ID if saved, undefined if new/generated */
  id?: number;
  /** Group name */
  name: string;
  /** Student IDs in this group */
  studentIds: number[];
}

/**
 * CooperativeTab – Manage cooperative student groups with drag & drop
 */
export function CooperativeTab({ selectedClass }: CooperativeTabProps) {
  const { t } = useI18n();
  /** Shorthand to access groupAssignments i18n keys */
  const gat = (key: string) => t(`dashboard.cooperative.groupAssignments.${key}`);

  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<LocalGroup[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showPriorityDialog, setShowPriorityDialog] = useState(false);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Drag state
  const [dragStudentId, setDragStudentId] = useState<number | null>(null);
  const [dragSourceGroup, setDragSourceGroup] = useState<number | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);

  // Collapse groups section
  const [groupsCollapsed, setGroupsCollapsed] = useState(false);

  // ── Group Assignments state ──
  const [assignments, setAssignments] = useState<GroupAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [activeQuarter, setActiveQuarter] = useState<1 | 2 | 3>(1);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<GroupAssignment | null>(null);
  const [confirmDeleteAssignment, setConfirmDeleteAssignment] = useState<GroupAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState(false);

  // Grades per assignment (keyed by assignmentId)
  const [gradesMap, setGradesMap] = useState<Record<number, GroupAssignmentGrade[]>>({});
  const [expandedAssignments, setExpandedAssignments] = useState<Set<number>>(new Set());
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [savingGrade, setSavingGrade] = useState<string | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<string | null>(null);

  // Documents modal state
  const [docsModal, setDocsModal] = useState<{
    assignmentId: number;
    groupId?: number | null;
    title: string;
    documents: GroupAssignmentDocument[];
  } | null>(null);

  /** Map of studentId → Student for quick lookup */
  const studentsMap = useMemo(() => {
    const map = new Map<number, Student>();
    for (const s of classStudents) {
      map.set(s.id, s);
    }
    return map;
  }, [classStudents]);

  /** Assignments filtered by the active quarter tab */
  const filteredAssignments = useMemo(
    () => assignments.filter(a => a.quarter === activeQuarter),
    [assignments, activeQuarter],
  );

  /** Count of assignments per quarter for tab badges */
  const quarterCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    for (const a of assignments) {
      if (a.quarter >= 1 && a.quarter <= 3) {
        counts[a.quarter as 1 | 2 | 3]++;
      }
    }
    return counts;
  }, [assignments]);

  /** IDs of all students assigned to any group */
  const assignedStudentIds = useMemo(() => {
    const ids = new Set<number>();
    for (const g of groups) {
      for (const sid of g.studentIds) {
        ids.add(sid);
      }
    }
    return ids;
  }, [groups]);

  /** Students from the class that are NOT in any group */
  const unassignedStudents = useMemo(() => {
    return classStudents.filter(s => !assignedStudentIds.has(s.id));
  }, [classStudents, assignedStudentIds]);

  /** Whether all class students are assigned to a group */
  const allAssigned = unassignedStudents.length === 0 && classStudents.length > 0;

  /** Whether all groups have valid size (3-4 members) */
  const allGroupsValidSize = useMemo(() => {
    if (groups.length === 0) return true;
    return groups.every(g => g.studentIds.length >= 3 && g.studentIds.length <= 4);
  }, [groups]);

  /** Whether save is allowed: all assigned + valid sizes */
  const canSave = allAssigned && allGroupsValidSize;

  const fetchData = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const [students, savedGroups] = await Promise.all([
        StudentService.getStudents(),
        StudentGroupService.getSavedGroups(selectedClass),
      ]);

      const filtered = students.filter(s => s.classIds.includes(selectedClass));
      setClassStudents(filtered);

      if (savedGroups.length > 0) {
        setGroups(savedGroups.map(g => ({
          id: g.id,
          name: g.name,
          studentIds: g.members.map(m => m.studentId),
        })));
        setIsSaved(true);
      } else {
        setGroups([]);
        setIsSaved(false);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.cooperative.loadError'));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, t]);

  /** Fetch group assignments for the class */
  const fetchAssignments = useCallback(async () => {
    if (!selectedClass) return;
    setAssignmentsLoading(true);
    try {
      const data = await GroupAssignmentService.getByClass(selectedClass);
      setAssignments(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : gat('loadError'));
      setErrorDialogOpen(true);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [selectedClass, t]);

  /** Fetch grades for a specific assignment */
  const fetchGrades = useCallback(async (assignmentId: number) => {
    try {
      const grades = await GroupAssignmentService.getGrades(assignmentId);
      setGradesMap(prev => ({ ...prev, [assignmentId]: grades }));
      // Populate grade inputs
      const inputs: Record<string, string> = {};
      for (const g of grades) {
        inputs[`${assignmentId}-${g.groupId}`] = String(g.grade);
      }
      setGradeInputs(prev => ({ ...prev, ...inputs }));
    } catch {
      // Silently handle – grades section will show empty
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isSaved && selectedClass) {
      fetchAssignments();
    }
  }, [isSaved, selectedClass, fetchAssignments]);

  /** Generate groups via the API and display them (unsaved) */
  const handleGenerate = async (prioritizeShape: boolean) => {
    if (!selectedClass) return;
    setShowPriorityDialog(false);
    setLoading(true);
    try {
      const generated = await StudentGroupService.generateGroups(selectedClass, prioritizeShape);
      setGroups(generated.map((studentIds, i) => ({
        name: `${t('dashboard.cooperative.groupName')} ${i + 1}`,
        studentIds,
      })));
      setIsSaved(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.cooperative.generateError'));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /** Save or update groups to the API */
  const handleSave = async () => {
    if (!selectedClass || !canSave) return;

    setSaving(true);
    try {
      const payload: SavedGroupRequest[] = groups.map(g => {
        const req: SavedGroupRequest = { name: g.name, studentIds: g.studentIds };
        if (g.id) {
          req.id = g.id;
        }
        return req;
      });

      if (isSaved) {
        await StudentGroupService.updateSavedGroups(selectedClass, payload);
      } else {
        await StudentGroupService.createSavedGroups(selectedClass, payload);
      }

      setSuccessMessage(t('dashboard.cooperative.saveSuccess'));
      setSuccessDialogOpen(true);
      await fetchData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.cooperative.saveError'));
      setErrorDialogOpen(true);
    } finally {
      setSaving(false);
    }
  };

  /** Delete all groups for the class */
  const handleDeleteAll = async () => {
    if (!selectedClass) return;
    setDeleting(true);
    try {
      await StudentGroupService.deleteSavedGroups(selectedClass);
      setSuccessMessage(t('dashboard.cooperative.deleteSuccess'));
      setSuccessDialogOpen(true);
      setGroups([]);
      setIsSaved(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.cooperative.deleteError'));
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  /** Update group name locally */
  const handleGroupNameChange = (index: number, name: string) => {
    setGroups(prev => prev.map((g, i) => i === index ? { ...g, name } : g));
  };

  // ── Native HTML5 Drag & Drop handlers ──

  const handleDragStart = (studentId: number, groupIndex: number) => {
    setDragStudentId(studentId);
    setDragSourceGroup(groupIndex);
  };

  const handleDragStartUnassigned = (studentId: number) => {
    setDragStudentId(studentId);
    setDragSourceGroup(-1); // -1 = unassigned area
  };

  const handleDragOver = (e: React.DragEvent, groupIndex: number) => {
    e.preventDefault();
    setDragOverGroup(groupIndex);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDragEnd = () => {
    setDragStudentId(null);
    setDragSourceGroup(null);
    setDragOverGroup(null);
  };

  /** Drop a student onto a group card */
  const handleDropOnGroup = (e: React.DragEvent, targetGroupIndex: number) => {
    e.preventDefault();
    setDragOverGroup(null);

    if (dragStudentId === null || dragSourceGroup === null) return;

    // Dropped on the same group – no-op
    if (dragSourceGroup === targetGroupIndex) {
      handleDragEnd();
      return;
    }

    const movingId = dragStudentId;
    const sourceIdx = dragSourceGroup;

    setGroups(prev => prev.map((g, i) => {
      if (sourceIdx >= 0 && i === sourceIdx) {
        return { ...g, studentIds: g.studentIds.filter(id => id !== movingId) };
      }
      if (i === targetGroupIndex && !g.studentIds.includes(movingId)) {
        return { ...g, studentIds: [...g.studentIds, movingId] };
      }
      return g;
    }));

    handleDragEnd();
  };

  /** Drop a student back onto the unassigned area */
  const handleDropUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGroup(null);

    if (dragStudentId === null || dragSourceGroup === null || dragSourceGroup < 0) {
      handleDragEnd();
      return;
    }

    const movingId = dragStudentId;
    const sourceIdx = dragSourceGroup;

    setGroups(prev => prev.map((g, i) => {
      if (i === sourceIdx) {
        return { ...g, studentIds: g.studentIds.filter(id => id !== movingId) };
      }
      return g;
    }));

    handleDragEnd();
  };

  // ── Group Assignments handlers ──

  /** Toggle expanded state of an assignment to show/hide grades */
  const toggleAssignmentExpand = async (assignmentId: number) => {
    setExpandedAssignments(prev => {
      const next = new Set(prev);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
        // Fetch grades if not yet loaded
        if (!gradesMap[assignmentId]) {
          fetchGrades(assignmentId);
        }
      }
      return next;
    });
  };

  /** Handle editing an assignment */
  const handleEditAssignment = (assignment: GroupAssignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  /** Handle deleting an assignment */
  const handleDeleteAssignmentConfirm = async () => {
    if (!confirmDeleteAssignment) return;
    setDeletingAssignment(true);
    try {
      await GroupAssignmentService.deleteAssignment(confirmDeleteAssignment.id);
      setSuccessMessage(gat('deleteSuccess'));
      setSuccessDialogOpen(true);
      await fetchAssignments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : gat('deleteError'));
      setErrorDialogOpen(true);
    } finally {
      setDeletingAssignment(false);
      setConfirmDeleteAssignment(null);
    }
  };

  /** Handle grade input change – filter to valid numeric input */
  const handleGradeInputChange = (key: string, value: string) => {
    // Allow only digits and one decimal point
    const filtered = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    setGradeInputs(prev => ({ ...prev, [key]: filtered }));
  };

  /** Save (upsert) a grade for a group */
  const handleSaveGrade = async (assignmentId: number, groupId: number) => {
    const key = `${assignmentId}-${groupId}`;
    const rawValue = gradeInputs[key];
    const numValue = Number(rawValue);

    if (rawValue === '' || rawValue === undefined || isNaN(numValue) || numValue < 0 || numValue > 10) {
      setErrorMessage(gat('validation.gradeRange'));
      setErrorDialogOpen(true);
      return;
    }

    setSavingGrade(key);
    try {
      await GroupAssignmentService.upsertGrade(assignmentId, groupId, numValue);
      setSuccessMessage(gat('gradeSuccess'));
      setSuccessDialogOpen(true);
      await fetchGrades(assignmentId);
      await fetchAssignments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : gat('gradeError'));
      setErrorDialogOpen(true);
    } finally {
      setSavingGrade(null);
    }
  };

  /** Delete a grade for a group */
  const handleDeleteGrade = async (assignmentId: number, groupId: number) => {
    const key = `${assignmentId}-${groupId}`;
    setDeletingGrade(key);
    try {
      await GroupAssignmentService.deleteGrade(assignmentId, groupId);
      setSuccessMessage(gat('gradeDeleteSuccess'));
      setSuccessDialogOpen(true);
      // Clear input
      setGradeInputs(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await fetchGrades(assignmentId);
      await fetchAssignments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : gat('gradeDeleteError'));
      setErrorDialogOpen(true);
    } finally {
      setDeletingGrade(null);
    }
  };

  /** Open documents modal for assignment or group */
  const openDocsModal = (assignmentId: number, groupId: number | null, titleStr: string, docs: GroupAssignmentDocument[]) => {
    setDocsModal({ assignmentId, groupId, title: titleStr, documents: docs });
  };

  /** Callback when documents changed inside the modal */
  const handleDocsChanged = async () => {
    await fetchAssignments();
    if (docsModal) {
      // Refresh grades too if it's a group document
      if (docsModal.groupId) {
        await fetchGrades(docsModal.assignmentId);
      }
      // Refresh the documents shown in the modal
      const refreshed = await GroupAssignmentService.getByClass(selectedClass!);
      const assignment = refreshed.find(a => a.id === docsModal.assignmentId);
      if (assignment) {
        if (docsModal.groupId) {
          const grades = await GroupAssignmentService.getGrades(docsModal.assignmentId);
          const gradeEntry = grades.find(g => g.groupId === docsModal.groupId);
          setDocsModal(prev => prev ? { ...prev, documents: gradeEntry?.documents ?? [] } : null);
        } else {
          setDocsModal(prev => prev ? { ...prev, documents: assignment.documents.filter(d => !d.groupDocument) } : null);
        }
      }
    }
  };

  // ── Render ──

  if (!selectedClass) {
    return (
      <div className="dashboard-empty">
        <Users className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.cooperative.noClassSelected')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-center">
        <Loader2 className="icon-spin" size={32} />
      </div>
    );
  }

  return (
    <>
      {/* ═══ GROUPS SECTION ═══ */}
      {/* Actions Header */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.cooperative.title')}</h2>
        <div className="cooperative-actions">
          {/* Generate button — only enabled if no persisted groups */}
          <button
            className="dashboard-add-btn cooperative-main-btn"
            onClick={() => setShowPriorityDialog(true)}
            disabled={isSaved || saving}
            title={isSaved ? t('dashboard.cooperative.generateDisabledHint') : ''}
          >
            <Shuffle size={16} className="icon-margin-right" />
            {t('dashboard.cooperative.generateGroups')}
          </button>

          {/* Save / Update button — disabled if not all students assigned or invalid group sizes */}
          {groups.length > 0 && (
            <button
              className="dashboard-add-btn cooperative-main-btn"
              onClick={handleSave}
              disabled={saving || !canSave}
              title={!allAssigned ? t('dashboard.cooperative.allStudentsMustBeAssigned') : !allGroupsValidSize ? t('dashboard.cooperative.groupSizeError') : ''}
            >
              {saving
                ? <Loader2 className="animate-spin" size={16} />
                : <Save size={16} className="icon-margin-right" />
              }
              {isSaved ? t('dashboard.cooperative.updateGroups') : t('dashboard.cooperative.saveGroups')}
            </button>
          )}

          {/* Delete all button */}
          {groups.length > 0 && (
            <button
              className="dashboard-add-btn cooperative-delete-btn cooperative-main-btn"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={saving}
            >
              <Trash2 size={16} className="icon-margin-right" />
              {t('dashboard.cooperative.deleteAllGroups')}
            </button>
          )}

          {/* Reload + Collapse icon buttons */}
          <div className="cooperative-icon-actions">
            {isSaved && groups.length > 0 && (
              <PortalTooltip text={t('dashboard.cooperative.reloadGroups')} as="span" position="bottom">
                <button
                  className="dashboard-add-btn"
                  onClick={fetchData}
                  disabled={saving || loading}
                  style={{ padding: '0.625rem' }}
                >
                  <RefreshCw size={16} />
                </button>
              </PortalTooltip>
            )}
            {groups.length > 0 && (
              <PortalTooltip text={groupsCollapsed ? t('dashboard.cooperative.expandGroups') : t('dashboard.cooperative.collapseGroups')} as="span" position="bottom">
                <button
                  className="dashboard-add-btn"
                  onClick={() => setGroupsCollapsed(prev => !prev)}
                  style={{ padding: '0.625rem' }}
                >
                  {groupsCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </PortalTooltip>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible groups content */}
      {!groupsCollapsed && (
        <>
          {/* Warning: unassigned students exist */}
          {groups.length > 0 && !allAssigned && (
            <div className="cooperative-warning">
              <p>{t('dashboard.cooperative.allStudentsMustBeAssigned')}</p>
              <p className="cooperative-warning-detail">
                {t('dashboard.cooperative.unassignedCount').replace('{count}', String(unassignedStudents.length))}
              </p>
            </div>
          )}

          {/* Warning: groups with invalid size */}
          {groups.length > 0 && allAssigned && !allGroupsValidSize && (
            <div className="cooperative-warning">
              <p>{t('dashboard.cooperative.groupSizeError')}</p>
            </div>
          )}

          {/* Empty state */}
          {groups.length === 0 && (
            <div className="dashboard-empty">
              <Users className="dashboard-empty-icon" />
              <p className="dashboard-empty-text">{t('dashboard.cooperative.noGroups')}</p>
              <p className="dashboard-empty-text" style={{ fontSize: '0.85rem' }}>
                {t('dashboard.cooperative.noGroupsHint')}
              </p>
            </div>
          )}

          {/* Groups grid */}
          {groups.length > 0 && (
            <div className="cooperative-groups-container">
              {groups.map((group, groupIndex) => (
                <div
                  key={group.id ?? `new-${groupIndex}`}
                  role="listbox"
                  tabIndex={0}
                  aria-label={group.name}
                  className={`cooperative-group-card ${dragOverGroup === groupIndex ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, groupIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropOnGroup(e, groupIndex)}
                >
                  {/* Group header with name input + student count */}
                  <div className="cooperative-group-header">
                    <input
                      type="text"
                      className="cooperative-group-name-input"
                      value={group.name}
                      onChange={(e) => handleGroupNameChange(groupIndex, e.target.value)}
                      placeholder={`${t('dashboard.cooperative.groupNamePlaceholder')} ${groupIndex + 1}`}
                    />
                    <span className={`cooperative-group-count ${group.studentIds.length < 3 || group.studentIds.length > 4 ? 'invalid-size' : ''}`}>
                      {group.studentIds.length}
                    </span>
                  </div>

                  {/* Student list inside this group */}
                  <div className="cooperative-student-list">
                    {group.studentIds.map(studentId => {
                      const student = studentsMap.get(studentId);
                      if (!student) return null;
                      return (
                        <div
                          key={studentId}
                          role="option"
                          tabIndex={0}
                          aria-selected={dragStudentId === studentId}
                          className={`cooperative-student-item ${dragStudentId === studentId ? 'dragging' : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(studentId, groupIndex)}
                          onDragEnd={handleDragEnd}
                        >
                          <GripVertical size={14} className="cooperative-grip-icon" />
                          <StudentPhoto
                            studentId={student.id}
                            photoFileName={student.photo}
                            gender={student.gender}
                            size={36}
                            alt={`${student.name} ${student.surnames}`}
                          />
                          <span className="cooperative-student-name">
                            {student.surnames}, {student.name}
                          </span>
                          {renderShapeBadge(student.shape)}
                        </div>
                      );
                    })}
                    {group.studentIds.length === 0 && (
                      <p className="cooperative-empty-group">{t('dashboard.cooperative.dragHint')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unassigned students drop zone */}
          {groups.length > 0 && unassignedStudents.length > 0 && (
            <div
              role="listbox"
              aria-label={t('dashboard.cooperative.unassignedStudents')}
              tabIndex={0}
              className="cooperative-unassigned"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropUnassigned}
            >
              <h3 className="cooperative-unassigned-title">
                {t('dashboard.cooperative.unassignedStudents')} ({unassignedStudents.length})
              </h3>
              <div className="cooperative-student-list">
                {unassignedStudents.map(student => (
                  <div
                    key={student.id}
                    role="option"
                    tabIndex={0}
                    aria-selected={dragStudentId === student.id}
                    className={`cooperative-student-item ${dragStudentId === student.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStartUnassigned(student.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <GripVertical size={14} className="cooperative-grip-icon" />
                    <StudentPhoto
                      studentId={student.id}
                      photoFileName={student.photo}
                      gender={student.gender}
                      size={36}
                      alt={`${student.name} ${student.surnames}`}
                    />
                    <span className="cooperative-student-name">
                      {student.surnames}, {student.name}
                    </span>
                    {renderShapeBadge(student.shape)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ GROUP ASSIGNMENTS SECTION ═══ */}
      {isSaved && (
        <>
          <h2 className="cooperative-assignments-title">{gat('title')}</h2>
          <div className="cooperative-assignments-section">
            <div className="dashboard-section-header">
              {/* Quarter tabs */}
              <div className="cooperative-quarter-tabs">
                {([1, 2, 3] as const).map(q => (
                  <button
                    key={q}
                    className={`cooperative-quarter-tab ${activeQuarter === q ? 'active' : ''}`}
                    onClick={() => setActiveQuarter(q)}
                  >
                    {t(`dashboard.evalCriteria.quarter${q}`)}
                    {quarterCounts[q] > 0 && (
                      <span className="cooperative-quarter-tab-count">{quarterCounts[q]}</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                className="dashboard-add-btn"
                onClick={() => { setEditingAssignment(null); setShowAssignmentForm(true); }}
              >
                <Plus size={16} className="icon-margin-right" />
                {gat('addAssignment')}
              </button>
            </div>

          {assignmentsLoading && (
            <div className="loading-center" style={{ padding: '2rem 0' }}>
              <Loader2 className="icon-spin" size={24} />
            </div>
          )}

          {!assignmentsLoading && filteredAssignments.length === 0 && (
            <div className="dashboard-empty" style={{ padding: '2rem 0' }}>
              <FileText className="dashboard-empty-icon" />
              <p className="dashboard-empty-text">{gat('noAssignments')}</p>
              <p className="dashboard-empty-text" style={{ fontSize: '0.85rem' }}>{gat('noAssignmentsHint')}</p>
            </div>
          )}

          {!assignmentsLoading && filteredAssignments.map(assignment => {
            const isExpanded = expandedAssignments.has(assignment.id);
            const assignmentGrades = gradesMap[assignment.id] || [];
            const assignmentDocs = assignment.documents.filter(d => !d.groupDocument);
            const docCount = assignmentDocs.length;

            return (
              <div key={assignment.id} className="cooperative-assignment-card">
                {/* Assignment header */}
                <div className="cooperative-assignment-header">
                  <button
                    className="cooperative-assignment-expand-btn"
                    onClick={() => toggleAssignmentExpand(assignment.id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div className="cooperative-assignment-info">
                    <span className="cooperative-assignment-title">{assignment.title}</span>
                    {Boolean(assignment.description) && (
                      <span className="cooperative-assignment-desc">{assignment.description}</span>
                    )}
                  </div>
                  <div className="cooperative-assignment-actions">
                    <PortalTooltip text={`${gat('documents')} (${docCount})`} as="span">
                      <button
                        className="eval-criteria-exercise-btn"
                        onClick={() => openDocsModal(assignment.id, null, `${gat('assignmentDocuments')}: ${assignment.title}`, assignmentDocs)}
                        aria-label={gat('documents')}
                      >
                        <FileText size={16} />
                        {docCount > 0 && <span className="cooperative-doc-count">{docCount}</span>}
                      </button>
                    </PortalTooltip>
                    <PortalTooltip text={gat('editAssignment')} as="span">
                      <button
                        className="eval-criteria-exercise-btn"
                        onClick={() => handleEditAssignment(assignment)}
                        aria-label={gat('editAssignment')}
                      >
                        <Edit size={16} />
                      </button>
                    </PortalTooltip>
                    <PortalTooltip text={gat('deleteAssignment')} as="span">
                      <button
                        className="eval-criteria-exercise-btn delete"
                        onClick={() => setConfirmDeleteAssignment(assignment)}
                        aria-label={gat('deleteAssignment')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </PortalTooltip>
                  </div>
                </div>

                {/* Grades section (expandable) */}
                {isExpanded && (
                  <div className="cooperative-grades-section">
                    <h4 className="cooperative-grades-title">{gat('grades')}</h4>
                    {groups.map(group => {
                      if (!group.id) return null;
                      const gradeKey = `${assignment.id}-${group.id}`;
                      const existingGrade = assignmentGrades.find(g => g.groupId === group.id);
                      const groupDocs = existingGrade?.documents ?? [];

                      return (
                        <div key={group.id} className="cooperative-grade-row">
                          <span className="cooperative-grade-group-name">{group.name}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            className={`cooperative-grade-input ${
                              gradeInputs[gradeKey] !== undefined && gradeInputs[gradeKey] !== '' &&
                              (isNaN(Number(gradeInputs[gradeKey])) || Number(gradeInputs[gradeKey]) < 0 || Number(gradeInputs[gradeKey]) > 10)
                                ? 'input-error' : ''
                            }`}
                            placeholder={gat('gradePlaceholder')}
                            value={gradeInputs[gradeKey] ?? ''}
                            onChange={(e) => handleGradeInputChange(gradeKey, e.target.value)}
                            maxLength={5}
                          />
                          <div className="cooperative-grade-actions">
                            <PortalTooltip text={gat('saveGrade')} as="span">
                              <button
                                className="eval-criteria-exercise-btn"
                                onClick={() => handleSaveGrade(assignment.id, group.id!)}
                                disabled={savingGrade === gradeKey}
                                aria-label={gat('saveGrade')}
                              >
                                {savingGrade === gradeKey ? <Loader2 size={14} className="icon-spin" /> : <Save size={14} />}
                              </button>
                            </PortalTooltip>
                            {existingGrade && (
                              <PortalTooltip text={gat('deleteGrade')} as="span">
                                <button
                                  className="eval-criteria-exercise-btn delete"
                                  onClick={() => handleDeleteGrade(assignment.id, group.id!)}
                                  disabled={deletingGrade === gradeKey}
                                  aria-label={gat('deleteGrade')}
                                >
                                  {deletingGrade === gradeKey ? <Loader2 size={14} className="icon-spin" /> : <Trash2 size={14} />}
                                </button>
                              </PortalTooltip>
                            )}
                            <PortalTooltip text={`${gat('groupDocuments')} (${groupDocs.length})`} as="span">
                              <button
                                className="eval-criteria-exercise-btn"
                                onClick={() => openDocsModal(assignment.id, group.id!, `${gat('groupDocuments')}: ${group.name}`, groupDocs)}
                                aria-label={gat('groupDocuments')}
                              >
                                <FileText size={14} />
                                {groupDocs.length > 0 && <span className="cooperative-doc-count">{groupDocs.length}</span>}
                              </button>
                            </PortalTooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </>
      )}
      {!isSaved && groups.length > 0 && (
        <div className="cooperative-warning" style={{ marginTop: '1.5rem' }}>
          <p>{gat('needSavedGroups')}</p>
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Priority Selection Dialog */}
      {showPriorityDialog && (
        <dialog className="modal-overlay" open={true}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
            <div className="modal-content" style={{ maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="modal-title">{t('dashboard.cooperative.choosePriority')}</h3>
                <button
                  onClick={() => setShowPriorityDialog(false)}
                  className="modal-button cancel"
                  style={{ padding: '0.5rem', minWidth: 'auto' }}
                  aria-label={t('common.close')}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {t('dashboard.cooperative.priorityDescription')}
                </p>
                <div className="cooperative-priority-options">
                  <button className="cooperative-priority-btn" onClick={() => handleGenerate(true)}>
                    <span className="cooperative-priority-icon">🔷</span>
                    <span>{t('dashboard.cooperative.prioritizeShape')}</span>
                  </button>
                  <button className="cooperative-priority-btn" onClick={() => handleGenerate(false)}>
                    <span className="cooperative-priority-icon">👫</span>
                    <span>{t('dashboard.cooperative.prioritizeGender')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Group Assignment Form Modal */}
      <GroupAssignmentFormModal
        isOpen={showAssignmentForm}
        onClose={() => { setShowAssignmentForm(false); setEditingAssignment(null); }}
        classId={selectedClass!}
        quarter={activeQuarter}
        editingAssignment={editingAssignment}
        onSaved={async () => {
          setSuccessMessage(editingAssignment ? gat('updateSuccess') : gat('createSuccess'));
          setSuccessDialogOpen(true);
          await fetchAssignments();
        }}
      />

      {/* Group Assignment Documents Modal */}
      {docsModal && (
        <GroupAssignmentDocumentsModal
          isOpen={true}
          onClose={() => setDocsModal(null)}
          assignmentId={docsModal.assignmentId}
          groupId={docsModal.groupId}
          title={docsModal.title}
          documents={docsModal.documents}
          onDocumentsChanged={handleDocsChanged}
        />
      )}

      {/* Confirm Delete Groups */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        title={t('dashboard.cooperative.deleteAllTitle')}
        itemName={t('dashboard.cooperative.allGroupsLabel')}
        confirmMessage={t('dashboard.cooperative.deleteAllConfirm')}
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteOpen(false)}
        isDeleting={deleting}
      />

      {/* Confirm Delete Assignment */}
      {confirmDeleteAssignment && (
        <ConfirmDeleteModal
          isOpen={true}
          title={gat('deleteAssignment')}
          itemName={confirmDeleteAssignment.title}
          confirmMessage={gat('deleteAssignmentConfirm').replace('{name}', confirmDeleteAssignment.title)}
          onConfirm={handleDeleteAssignmentConfirm}
          onCancel={() => setConfirmDeleteAssignment(null)}
          isDeleting={deletingAssignment}
        />
      )}

      <ErrorModal
        isOpen={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      <SuccessModal
        isOpen={successDialogOpen}
        message={successMessage}
        onClose={() => setSuccessDialogOpen(false)}
      />
    </>
  );
}

