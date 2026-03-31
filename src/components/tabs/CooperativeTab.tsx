import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Users, Shuffle, Save, Trash2, GripVertical, X, RefreshCw } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { StudentService, Student, Shape } from '../../services/StudentService';
import { StudentGroupService, SavedGroupRequest } from '../../services/StudentGroupService';
import { StudentPhoto } from '../students/StudentPhoto';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

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

  /** Map of studentId → Student for quick lookup */
  const studentsMap = useMemo(() => {
    const map = new Map<number, Student>();
    for (const s of classStudents) {
      map.set(s.id, s);
    }
    return map;
  }, [classStudents]);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      {/* Actions Header */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.cooperative.title')}</h2>
        <div className="cooperative-actions">
          {/* Generate button — only enabled if no persisted groups */}
          <button
            className="dashboard-add-btn"
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
              className="dashboard-add-btn"
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
              className="dashboard-add-btn cooperative-delete-btn"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={saving}
            >
              <Trash2 size={16} className="icon-margin-right" />
              {t('dashboard.cooperative.deleteAllGroups')}
            </button>
          )}

          {/* Reload saved groups (discard local changes) */}
          {isSaved && groups.length > 0 && (
            <button
              className="dashboard-add-btn"
              onClick={fetchData}
              disabled={saving || loading}
              title={t('dashboard.cooperative.reloadGroups')}
              style={{ padding: '0.5rem' }}
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

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

      {/* Priority Selection Dialog */}
      {showPriorityDialog && (
        <dialog className="modal-overlay" open={true}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '1rem' }}>
            <div className="modal-content" style={{ maxWidth: '420px', width: '100%' }}>
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
                  <button
                    className="cooperative-priority-btn"
                    onClick={() => handleGenerate(true)}
                  >
                    <span className="cooperative-priority-icon">🔷</span>
                    <span>{t('dashboard.cooperative.prioritizeShape')}</span>
                  </button>
                  <button
                    className="cooperative-priority-btn"
                    onClick={() => handleGenerate(false)}
                  >
                    <span className="cooperative-priority-icon">👫</span>
                    <span>{t('dashboard.cooperative.prioritizeGender')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Confirm Delete All Modal */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        title={t('dashboard.cooperative.deleteAllTitle')}
        itemName={t('dashboard.cooperative.allGroupsLabel')}
        confirmMessage={t('dashboard.cooperative.deleteAllConfirm')}
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteOpen(false)}
        isDeleting={deleting}
      />

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

