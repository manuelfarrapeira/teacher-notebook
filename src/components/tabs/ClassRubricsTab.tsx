import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Loader2, Plus, Trash2, Info, Settings, X, PieChart } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { SkillService, Skill } from '../../services/SkillService';
import { SkillRubricService, SkillRubric } from '../../services/SkillRubricService';
import { StudentService, Student } from '../../services/StudentService';
import {
  ClassRubricService,
  ClassRubric,
  ClassRubricCriterion,
  StudentCriteriaGroup,
  StudentCriterionAssignment,
} from '../../services/ClassRubricService';
import { ApiErrorException } from '../../services/BaseService';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { RubricDistributionChartModal } from '../modals/RubricDistributionChartModal';
import { StudentPhoto } from '../students/StudentPhoto';

// ========================
// Portal Tooltip
// ========================

/**
 * Tooltip rendered via portal so it escapes any overflow container.
 */
function ClassRubricsTooltip({ text, children, position = 'top', as = 'button' }: {
  readonly text: string;
  readonly children: React.ReactNode;
  readonly position?: 'top' | 'bottom';
  readonly as?: 'button' | 'span';
}) {
  const triggerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = position === 'bottom' ? rect.bottom + 8 : rect.top - 8;
    setCoords({ top, left });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  const Tag = as;

  return (
    <>
      <Tag
        ref={triggerRef as React.RefObject<HTMLButtonElement & HTMLSpanElement>}
        className="class-rubrics-tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
        {...(as === 'button' ? { type: 'button' as const } : {})}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {children}
      </Tag>
      {visible && ReactDOM.createPortal(
        <div
          className="class-rubrics-tooltip-popup"
          style={{
            top: coords.top,
            left: coords.left,
            transform: position === 'bottom'
              ? 'translateX(-50%)'
              : 'translate(-50%, -100%)',
          }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}

// ========================
// Props
// ========================

/**
 * Props for ClassRubricsTab
 */
interface ClassRubricsTabProps {
  /** Currently selected class ID */
  readonly selectedClass: number | null;
}

// ========================
// Helper: get error message
// ========================

function getErrorMsg(error: unknown, fallback: string): string {
  if (error instanceof ApiErrorException) {
    const reasons = error.apiError.details?.map(d => d.reason).join('. ');
    return reasons || error.apiError.detail || error.apiError.description || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

// ========================
// Component
// ========================

/**
 * ClassRubricsTab — Table of rubrics per skill assigned to the class.
 * Students as rows, rubrics as columns. Each cell shows the assigned criterion
 * or a button to assign one.
 */
export function ClassRubricsTab({ selectedClass }: ClassRubricsTabProps) {
  const { t } = useI18n();

  // ---- Data state ----
  const [skills, setSkills] = useState<Skill[]>([]);
  const [classRubrics, setClassRubrics] = useState<ClassRubric[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [studentCriteria, setStudentCriteria] = useState<StudentCriteriaGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- Selection state ----
  const [selectedSkillId, setSelectedSkillId] = useState<number>(0);

  // ---- Manage rubrics modal ----
  const [showManageModal, setShowManageModal] = useState(false);
  const [skillRubrics, setSkillRubrics] = useState<SkillRubric[]>([]);
  const [loadingSkillRubrics, setLoadingSkillRubrics] = useState(false);
  const [assigningRubric, setAssigningRubric] = useState<number | null>(null);

  // ---- Criterion selection modal ----
  const [criterionModal, setCriterionModal] = useState<{
    classRubricId: number;
    studentId: number;
    studentName: string;
    rubricTitle: string;
    criteria: ClassRubricCriterion[];
  } | null>(null);
  const [assigningCriterion, setAssigningCriterion] = useState(false);

  // ---- Delete state ----
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'criterion' | 'rubric';
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Feedback modals ----
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ---- Chart modal ----
  const [rubricChartModal, setRubricChartModal] = useState<{
    title: string;
    entries: Array<{ studentName: string; criterion: { description: string; gradeStart: number; gradeEnd: number } | null }>;
  } | null>(null);

  // ========================
  // Data fetching
  // ========================

  const fetchSkills = useCallback(async () => {
    try {
      const data = await SkillService.getSkills();
      setSkills(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedSkillId) {
        setSelectedSkillId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  }, []);

  const fetchClassRubrics = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await ClassRubricService.getClassRubrics(selectedClass);
      setClassRubrics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching class rubrics:', error);
    }
  }, [selectedClass]);

  const fetchClassStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const allStudents = await StudentService.getStudents();
      const filtered = allStudents.filter(s => s.classIds.includes(selectedClass));
      setClassStudents(filtered);
    } catch (error) {
      console.error('Error fetching class students:', error);
    }
  }, [selectedClass]);

  const fetchStudentCriteria = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await ClassRubricService.getAllStudentCriteria(selectedClass);
      setStudentCriteria(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching student criteria:', error);
    }
  }, [selectedClass]);

  const loadAll = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      await Promise.all([fetchSkills(), fetchClassRubrics(), fetchClassStudents(), fetchStudentCriteria()]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchSkills, fetchClassRubrics, fetchClassStudents, fetchStudentCriteria]);

  useEffect(() => {
    if (selectedClass) {
      setSelectedSkillId(0);
      loadAll();
    } else {
      setSkills([]);
      setClassRubrics([]);
      setClassStudents([]);
      setStudentCriteria([]);
    }
  }, [selectedClass]);

  // Auto-select first skill when skills load
  useEffect(() => {
    if (skills.length > 0 && !selectedSkillId) {
      setSelectedSkillId(skills[0].id);
    }
  }, [skills]);

  // ========================
  // Derived data
  // ========================

  /** Rubrics filtered by the selected skill */
  const filteredRubrics: ClassRubric[] = useMemo(() => {
    if (!selectedSkillId) return [];
    return classRubrics.filter(r => r.skillId === selectedSkillId);
  }, [classRubrics, selectedSkillId]);

  /** Get the criterion assignment for a student + classRubricId */
  const getStudentCriterion = (studentId: number, classRubricId: number): StudentCriterionAssignment | undefined => {
    const group = studentCriteria.find(g => g.student.id === studentId);
    if (!group) return undefined;
    return group.rubricCriteria.find(rc => rc.classRubricId === classRubricId);
  };

  /** Open chart modal for a specific rubric column */
  const openChartForRubric = (rubric: ClassRubric) => {
    const entries = classStudents.map(student => {
      const assignment = getStudentCriterion(student.id, rubric.id);
      return {
        studentName: `${student.surnames}, ${student.name}`,
        criterion: assignment
          ? {
              description: assignment.criterion.description,
              gradeStart: assignment.criterion.gradeStart,
              gradeEnd: assignment.criterion.gradeEnd,
            }
          : null,
      };
    });
    setRubricChartModal({ title: rubric.rubricTitle, entries });
  };

  // ========================
  // Handlers
  // ========================

  const handleSkillChange = (value: string) => {
    setSelectedSkillId(Number(value));
  };

  // ---- Manage rubrics modal ----

  const openManageModal = async () => {
    if (!selectedSkillId) return;
    setShowManageModal(true);
    setLoadingSkillRubrics(true);
    try {
      const data = await SkillRubricService.getRubrics(selectedSkillId);
      setSkillRubrics(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(getErrorMsg(error, t('dashboard.classRubrics.loadError')));
      setErrorDialogOpen(true);
    } finally {
      setLoadingSkillRubrics(false);
    }
  };

  const isRubricAssigned = (rubricId: number): ClassRubric | undefined => {
    return classRubrics.find(cr => cr.rubricId === rubricId);
  };

  const handleAssignRubric = async (rubricId: number) => {
    if (!selectedClass) return;
    setAssigningRubric(rubricId);
    try {
      await ClassRubricService.assignRubricToClass(selectedClass, rubricId);
      setSuccessMessage(t('dashboard.classRubrics.rubricAssignSuccess'));
      setSuccessDialogOpen(true);
      await fetchClassRubrics();
      await fetchStudentCriteria();
    } catch (error) {
      setErrorMessage(getErrorMsg(error, t('dashboard.classRubrics.rubricAssignError')));
      setErrorDialogOpen(true);
    } finally {
      setAssigningRubric(null);
    }
  };

  const handleRemoveRubricClick = (classRubric: ClassRubric) => {
    setDeleteTarget({ type: 'rubric', id: classRubric.id, name: classRubric.rubricTitle });
    setConfirmDeleteOpen(true);
  };

  // ---- Criterion assignment ----

  const handleAddCriterionClick = (classRubric: ClassRubric, student: Student) => {
    setCriterionModal({
      classRubricId: classRubric.id,
      studentId: student.id,
      studentName: `${student.surnames}, ${student.name}`,
      rubricTitle: classRubric.rubricTitle,
      criteria: classRubric.criteria,
    });
  };

  const handleSelectCriterion = async (criterionId: number) => {
    if (!criterionModal) return;
    setAssigningCriterion(true);
    try {
      await ClassRubricService.assignCriterionToStudent(
        criterionModal.classRubricId,
        criterionModal.studentId,
        criterionId,
      );
      setSuccessMessage(t('dashboard.classRubrics.assignSuccess'));
      setSuccessDialogOpen(true);
      setCriterionModal(null);
      await fetchStudentCriteria();
    } catch (error) {
      setErrorMessage(getErrorMsg(error, t('dashboard.classRubrics.assignError')));
      setErrorDialogOpen(true);
    } finally {
      setAssigningCriterion(false);
    }
  };

  const handleRemoveCriterionClick = (assignment: StudentCriterionAssignment) => {
    setDeleteTarget({
      type: 'criterion',
      id: assignment.id,
      name: `${assignment.criterion.gradeStart}–${assignment.criterion.gradeEnd}: ${assignment.criterion.description}`,
    });
    setConfirmDeleteOpen(true);
  };

  // ---- Confirm delete ----

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'criterion') {
        await ClassRubricService.removeStudentCriterion(deleteTarget.id);
        setSuccessMessage(t('dashboard.classRubrics.removeSuccess'));
      } else {
        await ClassRubricService.removeRubricFromClass(deleteTarget.id);
        setSuccessMessage(t('dashboard.classRubrics.rubricRemoveSuccess'));
      }
      setSuccessDialogOpen(true);
      await Promise.all([fetchClassRubrics(), fetchStudentCriteria()]);
    } catch (error) {
      const fallback = deleteTarget.type === 'criterion'
        ? t('dashboard.classRubrics.removeError')
        : t('dashboard.classRubrics.rubricRemoveError');
      setErrorMessage(getErrorMsg(error, fallback));
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // ========================
  // Render helpers
  // ========================

  /** Renders the table content or empty states for table area */
  const renderTableContent = () => {
    if (classStudents.length === 0) {
      return (
        <div className="dashboard-empty">
          <p className="dashboard-empty-text">{t('dashboard.classRubrics.noStudentsInClass')}</p>
        </div>
      );
    }
    return (
      <>
      {filteredRubrics.length === 0 && (
        <div style={{ color: '#7a8078', fontSize: '0.85rem', marginBottom: '0.75rem', textAlign: 'center' }}>
          {t('dashboard.classRubrics.noRubricsForSkill')}
        </div>
      )}
      <div className="class-rubrics-table-container">
        <div className="class-rubrics-table-wrapper">
          <table className="class-rubrics-table">
            <thead>
              <tr>
                <th className="class-rubrics-student-col">{t('dashboard.classRubrics.student')}</th>
                {filteredRubrics.map(rubric => (
                  <th key={rubric.id}>
                    <div className="class-rubrics-rubric-header">
                      <span className="class-rubrics-rubric-title">{rubric.rubricTitle}</span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {rubric.criteria.length} {t('dashboard.skills.rubrics.criteria')}
                      </span>
                      <div className="class-rubrics-rubric-actions">
                        <ClassRubricsTooltip text={t('dashboard.classRubrics.chart.title')} as="span">
                          <button
                            className="class-rubrics-criterion-btn"
                            onClick={() => openChartForRubric(rubric)}
                            aria-label={t('dashboard.classRubrics.chart.title')}
                          >
                            <PieChart size={14} />
                          </button>
                        </ClassRubricsTooltip>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, index) => (
                <tr key={student.id}>
                  <td className="class-rubrics-student-col">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span>{index + 1}. {student.surnames}, {student.name}</span>
                      <StudentPhoto
                        studentId={student.id}
                        photoFileName={student.photo}
                        gender={student.gender}
                        size={42}
                        alt={`${student.name} ${student.surnames}`}
                      />
                    </div>
                  </td>
                  {filteredRubrics.map(rubric => {
                    const assignment = getStudentCriterion(student.id, rubric.id);
                    return (
                      <td key={rubric.id}>
                        {assignment ? (
                          <div className="class-rubrics-criterion-cell">
                            <span className="class-rubrics-grade-badge">
                              {assignment.criterion.gradeStart}–{assignment.criterion.gradeEnd}
                            </span>
                            <ClassRubricsTooltip text={assignment.criterion.description} position="bottom">
                              <Info size={14} />
                            </ClassRubricsTooltip>
                            <div className="class-rubrics-criterion-actions">
                              <ClassRubricsTooltip text={t('dashboard.classRubrics.removeCriterion')} as="span">
                                <button
                                  className="class-rubrics-criterion-btn delete"
                                  onClick={() => handleRemoveCriterionClick(assignment)}
                                  aria-label={t('dashboard.classRubrics.removeCriterion')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </ClassRubricsTooltip>
                            </div>
                          </div>
                        ) : (
                          <ClassRubricsTooltip text={t('dashboard.classRubrics.assignCriterion')} as="span">
                            <button
                              className="class-rubrics-add-criterion-btn"
                              onClick={() => handleAddCriterionClick(rubric, student)}
                            >
                              <Plus size={14} />
                            </button>
                          </ClassRubricsTooltip>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
    );
  };

  /** Renders the manage rubrics modal body content */
  const renderManageModalBody = () => {
    if (loadingSkillRubrics) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <Loader2 className="icon-spin" size={24} />
        </div>
      );
    }
    if (skillRubrics.length === 0) {
      return (
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
          {t('dashboard.skills.rubrics.noRubrics')}
        </p>
      );
    }
    return (
      <div className="class-rubrics-manage-list">
        {skillRubrics.map(rubric => {
          const assignedClassRubric = isRubricAssigned(rubric.id);
          const isAssigned = Boolean(assignedClassRubric);
          const isCurrentlyAssigning = assigningRubric === rubric.id;

          return (
            <div key={rubric.id} className="class-rubrics-manage-item">
              <div className="class-rubrics-manage-item-info">
                <span className="class-rubrics-manage-item-title">{rubric.title}</span>
                <span className="class-rubrics-manage-item-criteria">
                  {rubric.criteria.length} {t('dashboard.skills.rubrics.criteria')}
                </span>
              </div>
              <span className={`class-rubrics-manage-item-badge ${isAssigned ? 'assigned' : 'not-assigned'}`}>
                {isAssigned ? t('dashboard.classRubrics.assigned') : t('dashboard.classRubrics.notAssigned')}
              </span>
              {isAssigned && assignedClassRubric ? (
                <button
                  className="modal-button cancel"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minWidth: 'auto', color: '#dc2626', borderColor: '#fecaca' }}
                  onClick={() => handleRemoveRubricClick(assignedClassRubric)}
                  disabled={Boolean(assigningRubric)}
                >
                  <Trash2 size={14} style={{ marginRight: '0.25rem' }} />
                  {t('dashboard.classRubrics.removeRubric')}
                </button>
              ) : (
                <button
                  className="modal-button save"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minWidth: 'auto' }}
                  onClick={() => handleAssignRubric(rubric.id)}
                  disabled={Boolean(assigningRubric)}
                >
                  {isCurrentlyAssigning ? (
                    <Loader2 className="icon-spin" size={14} />
                  ) : (
                    <>
                      <Plus size={14} style={{ marginRight: '0.25rem' }} />
                      {t('dashboard.classRubrics.assignRubric')}
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ========================
  // Render: empty states
  // ========================

  if (!selectedClass) {
    return (
      <div className="dashboard-empty">
        <p className="dashboard-empty-text">{t('dashboard.classRubrics.noClassSelected')}</p>
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

  if (skills.length === 0) {
    return (
      <div className="dashboard-empty">
        <p className="dashboard-empty-text">{t('dashboard.classRubrics.noSkills')}</p>
      </div>
    );
  }

  // ========================
  // Render
  // ========================

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Toolbar: skill selector + manage button */}
      <div className="class-rubrics-toolbar">
        <Select value={selectedSkillId ? String(selectedSkillId) : ''} onValueChange={handleSkillChange}>
          <SelectTrigger className="class-rubrics-skill-select">
            <SelectValue placeholder={t('dashboard.classRubrics.selectSkill')} />
          </SelectTrigger>
          <SelectContent>
            {skills.map(skill => (
              <SelectItem key={skill.id} value={String(skill.id)}>
                {skill.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          className="dashboard-add-btn"
          onClick={openManageModal}
          disabled={!selectedSkillId}
        >
          <Settings size={16} style={{ marginRight: '0.25rem' }} />
          {t('dashboard.classRubrics.manageClassRubrics')}
        </button>
      </div>

      {/* Table */}
      {renderTableContent()}

      {/* ============================
          Modal: Select Criterion
          ============================ */}
      {criterionModal && (
        <dialog className="modal-overlay" open={true} aria-label={t('dashboard.classRubrics.selectCriterion')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
            <div className="modal-content" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="modal-title">{t('dashboard.classRubrics.selectCriterion')}</h3>
                <button
                  onClick={() => setCriterionModal(null)}
                  className="modal-button cancel"
                  style={{ padding: '0.5rem', minWidth: 'auto' }}
                  aria-label={t('common.close')}
                  disabled={assigningCriterion}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#7a8078', margin: 0 }}>
                  <strong>{criterionModal.studentName}</strong> — {criterionModal.rubricTitle}
                </p>
              </div>

              {criterionModal.criteria.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  {t('dashboard.classRubrics.noCriteriaAvailable')}
                </p>
              ) : (
                <div className="class-rubrics-select-list">
                  {criterionModal.criteria.map(criterion => (
                    <button
                      key={criterion.id}
                      className="class-rubrics-select-item"
                      onClick={() => handleSelectCriterion(criterion.id)}
                      disabled={assigningCriterion}
                    >
                      <span className="class-rubrics-grade-badge">
                        {criterion.gradeStart}–{criterion.gradeEnd}
                      </span>
                      <span className="class-rubrics-select-item-desc">
                        {criterion.description}
                      </span>
                      {assigningCriterion && <Loader2 className="icon-spin" size={14} />}
                    </button>
                  ))}
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button
                  className="modal-button cancel"
                  onClick={() => setCriterionModal(null)}
                  disabled={assigningCriterion}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* ============================
          Modal: Manage Class Rubrics
          ============================ */}
      {showManageModal && (
        <dialog className="modal-overlay" open={true} aria-label={t('dashboard.classRubrics.manageClassRubrics')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
            <div className="modal-content" style={{ maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="modal-title">
                  {t('dashboard.classRubrics.availableRubrics')}
                </h3>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="modal-button cancel"
                  style={{ padding: '0.5rem', minWidth: 'auto' }}
                  aria-label={t('common.close')}
                >
                  <X size={20} />
                </button>
              </div>

              {renderManageModalBody()}

              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button
                  className="modal-button cancel"
                  onClick={() => setShowManageModal(false)}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* ============================
          Confirm Delete Modal
          ============================ */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={confirmDeleteOpen}
          title={
            deleteTarget.type === 'criterion'
              ? t('dashboard.classRubrics.removeCriterionTitle')
              : t('dashboard.classRubrics.removeRubricTitle')
          }
          itemName={deleteTarget.name}
          confirmMessage={
            deleteTarget.type === 'criterion'
              ? t('dashboard.classRubrics.removeCriterionConfirm')
              : t('dashboard.classRubrics.removeRubricConfirm')
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setConfirmDeleteOpen(false);
            setDeleteTarget(null);
          }}
          isDeleting={deleting}
        />
      )}

      {/* Rubric Distribution Chart Modal */}
      {rubricChartModal && (
        <RubricDistributionChartModal
          isOpen={Boolean(rubricChartModal)}
          onClose={() => setRubricChartModal(null)}
          title={rubricChartModal.title}
          entries={rubricChartModal.entries}
        />
      )}

      {/* Feedback modals */}
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
    </div>
  );
}


