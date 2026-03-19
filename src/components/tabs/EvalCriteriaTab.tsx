import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, Plus, Info, FileText, Trash2, Edit, Trash, Frown, Smile, Download } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { SubjectService, ClassSubject } from '../../services/SubjectService';
import { StudentService, Student } from '../../services/StudentService';
import {
  ExerciseService,
  QuarterExercises,
  Exercise,
  StudentGrades,
  GradeExercise,
  ExerciseDocument,
  GradeDocument,
} from '../../services/ExerciseService';
import { ApiErrorException } from '../../services/BaseService';
import { ExerciseFormModal } from '../modals/ExerciseFormModal';
import { GradeFormModal } from '../modals/GradeFormModal';
import { DocumentsModal } from '../modals/DocumentsModal';
import { GradeDocumentsModal } from '../modals/GradeDocumentsModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { StudentPhoto } from '../students/StudentPhoto';
import { PortalTooltip } from '../ui/PortalTooltip';

// Alias for backwards compatibility within this file
const EvalCriteriaTooltip = PortalTooltip;

/**
 * Props for EvalCriteriaTab
 */
interface EvalCriteriaTabProps {
  /** Currently selected class ID */
  readonly selectedClass: number | null;
}

/**
 * EvalCriteriaTab Ã¢â‚¬â€œ Rubrics table with exercises, grades and documents
 */
export function EvalCriteriaTab({ selectedClass }: EvalCriteriaTabProps) {
  const { t } = useI18n();

  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [quarterExercises, setQuarterExercises] = useState<QuarterExercises[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrades[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedSubjectClassId, setSelectedSubjectClassId] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [activeQuarter, setActiveQuarter] = useState<number>(1);

  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [gradeModal, setGradeModal] = useState<{
    exerciseId: number;
    maxGrade: number;
    studentId: number;
    studentName: string;
    existing?: { gradeId: number; grade: number; description: string } | null;
  } | null>(null);
  const [docsModal, setDocsModal] = useState<{
    exerciseId: number;
    exerciseTitle: string;
    documents: ExerciseDocument[];
  } | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<{ gradeId: number; exerciseTitle: string } | null>(null);
  const [gradeDocsModal, setGradeDocsModal] = useState<{
    gradeId: number;
    title: string;
    documents: GradeDocument[];
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  const fetchSubjects = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await SubjectService.getClassSubjects(selectedClass);
      setClassSubjects(data);
      if (data.length > 0 && !selectedSubjectClassId) {
        setSelectedSubjectClassId(data[0].subjectClassId);
        setSelectedSubjectId(data[0].subjectId);
      }
    } catch (error) {
      console.error('Error fetching class subjects:', error);
    }
  }, [selectedClass]);

  const fetchExercises = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await ExerciseService.getExercises(selectedClass);
      setQuarterExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
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

  const fetchGrades = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await ExerciseService.getGrades(selectedClass);
      setStudentGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  }, [selectedClass]);

  const loadAll = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      await Promise.all([fetchSubjects(), fetchExercises(), fetchGrades(), fetchClassStudents()]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchSubjects, fetchExercises, fetchGrades, fetchClassStudents]);

  useEffect(() => {
    if (selectedClass) {
      setSelectedSubjectClassId(0);
      setSelectedSubjectId(0);
      setActiveQuarter(1);
      loadAll();
    } else {
      setClassSubjects([]);
      setClassStudents([]);
      setQuarterExercises([]);
      setStudentGrades([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (classSubjects.length > 0 && !selectedSubjectClassId) {
      setSelectedSubjectClassId(classSubjects[0].subjectClassId);
      setSelectedSubjectId(classSubjects[0].subjectId);
    }
  }, [classSubjects]);


  /** Exercises filtered by selected subject + quarter */
  const filteredExercises: Exercise[] = useMemo(() => {
    if (!selectedSubjectId || !activeQuarter) return [];
    const qData = quarterExercises.find(q => q.quarter === activeQuarter);
    if (!qData) return [];
    const subjectData = qData.subjects.find(s => s.subjectId === selectedSubjectId);
    return subjectData ? subjectData.exercises : [];
  }, [quarterExercises, selectedSubjectId, activeQuarter]);

  /** Sum of percentageGrade of all exercises in the current subject+quarter */
  const totalPercentage = useMemo(() => {
    return filteredExercises.reduce((sum, ex) => sum + ex.percentageGrade, 0);
  }, [filteredExercises]);

  /**
   * Calculate the final grade (over 10) for a student.
   * Each exercise contributes: (grade / maxGrade) * (percentageGrade / 100) * 10
   * If total percentage < 100%, the missing % counts as 0.
   * Always calculated over 100% (not scaled up).
   */
  const calculateFinalGrade = (studentId: number): number | null => {
    if (filteredExercises.length === 0) return null;
    let hasAnyGrade = false;
    let weightedSum = 0;
    for (const ex of filteredExercises) {
      const gradeData = getStudentGrade(studentId, ex.id);
      if (gradeData) {
        hasAnyGrade = true;
        weightedSum += (gradeData.grade / gradeData.maxGrade) * (ex.percentageGrade / 100) * 10;
      }
    }
    if (!hasAnyGrade) return null;
    return Math.round(weightedSum * 100) / 100;
  };

  /** Helper: get grade for student + exercise */
  const getStudentGrade = (studentId: number, exerciseId: number): GradeExercise | undefined => {
    const student = studentGrades.find(s => s.studentId === studentId);
    if (!student) return undefined;
    for (const q of student.quarters) {
      if (q.quarter !== activeQuarter) continue;
      for (const sub of q.subjects) {
        if (sub.subjectId !== selectedSubjectId) continue;
        const found = sub.exercises.find(e => e.exerciseId === exerciseId);
        if (found) return found;
      }
    }
    return undefined;
  };


  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scId = Number(e.target.value);
    setSelectedSubjectClassId(scId);
    const cs = classSubjects.find(c => c.subjectClassId === scId);
    if (cs) setSelectedSubjectId(cs.subjectId);
  };

  const handleExerciseCreated = () => {
    setSuccessMessage(t('dashboard.rubrics.createExerciseSuccess'));
    setSuccessDialogOpen(true);
    fetchExercises();
    fetchGrades();
  };

  const handleExerciseUpdated = () => {
    setSuccessMessage(t('dashboard.rubrics.updateExerciseSuccess'));
    setSuccessDialogOpen(true);
    setExerciseToEdit(null);
    fetchExercises();
    fetchGrades();
  };

  const handleDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    setDeleting(true);
    try {
      await ExerciseService.deleteExercise(exerciseToDelete.id);
      setSuccessMessage(t('dashboard.rubrics.deleteExerciseSuccess'));
      setSuccessDialogOpen(true);
      await Promise.all([fetchExercises(), fetchGrades()]);
    } catch (error) {
      const msg = error instanceof ApiErrorException
        ? (error.apiError.detail || error.apiError.description)
        : (error instanceof Error ? error.message : t('dashboard.rubrics.deleteExerciseError'));
      setErrorMessage(msg);
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
      setExerciseToDelete(null);
    }
  };

  const handleGradeSuccess = () => {
    setSuccessMessage(
      gradeModal?.existing
        ? t('dashboard.rubrics.updateGradeSuccess')
        : t('dashboard.rubrics.createGradeSuccess')
    );
    setSuccessDialogOpen(true);
    fetchGrades();
  };

  const handleDeleteGrade = async () => {
    if (!gradeToDelete) return;
    setDeleting(true);
    try {
      await ExerciseService.deleteGrade(gradeToDelete.gradeId);
      setSuccessMessage(t('dashboard.rubrics.deleteGradeSuccess'));
      setSuccessDialogOpen(true);
      fetchGrades();
    } catch (error) {
      const msg = error instanceof ApiErrorException
        ? (error.apiError.detail || error.apiError.description)
        : (error instanceof Error ? error.message : t('dashboard.rubrics.deleteGradeError'));
      setErrorMessage(msg);
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
      setGradeToDelete(null);
    }
  };

  const handleDocumentsChanged = () => {
    void fetchExercises();
  };

  const handleGradeDocumentsChanged = () => {
    void fetchGrades();
  };

  /** Export grades as Excel */
  const handleExportGrades = async () => {
    if (!selectedClass) return;
    setExporting(true);
    try {
      const blob = await ExerciseService.exportGrades(selectedClass);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rubrics_class_${selectedClass}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const msg = error instanceof ApiErrorException
        ? (error.apiError.detail || error.apiError.description)
        : (error instanceof Error ? error.message : t('dashboard.rubrics.exportGradesError'));
      setErrorMessage(msg);
      setErrorDialogOpen(true);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (docsModal) {
      const exercise = filteredExercises.find(e => e.id === docsModal.exerciseId);
      if (exercise) {
        setDocsModal(prev => prev ? { ...prev, documents: exercise.documents } : null);
      }
    }
  }, [filteredExercises]);

  useEffect(() => {
    if (gradeDocsModal) {
      for (const sg of studentGrades) {
        for (const q of sg.quarters) {
          for (const sub of q.subjects) {
            for (const ex of sub.exercises) {
              if (ex.gradeId === gradeDocsModal.gradeId) {
                setGradeDocsModal(prev => prev ? { ...prev, documents: ex.documents } : null);
                return;
              }
            }
          }
        }
      }
    }
  }, [studentGrades]);


  if (!selectedClass) {
    return (
      <div className="dashboard-empty">
        <p className="dashboard-empty-text">{t('dashboard.rubrics.noClassSelected')}</p>
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

  if (classSubjects.length === 0) {
    return (
      <div className="dashboard-empty">
        <p className="dashboard-empty-text">{t('dashboard.rubrics.selectSubjectFirst')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Toolbar: subject selector + create btn + quarter tabs */}
      <div className="eval-criteria-toolbar">
        <select
          className="eval-criteria-subject-select"
          value={selectedSubjectClassId}
          onChange={handleSubjectChange}
        >
          {classSubjects.map(cs => (
            <option key={cs.subjectClassId} value={cs.subjectClassId}>
              {cs.subjectName}
            </option>
          ))}
        </select>

        <button
          className="dashboard-add-btn"
          onClick={() => setShowExerciseForm(true)}
          disabled={!selectedSubjectClassId}
        >
          <Plus size={16} style={{ marginRight: '0.25rem' }} />
          {t('dashboard.rubrics.createExercise')}
        </button>

        <div className="eval-criteria-quarter-tabs">
          {[1, 2, 3].map(q => (
            <button
              key={q}
              className={`eval-criteria-quarter-tab ${activeQuarter === q ? 'active' : ''}`}
              onClick={() => setActiveQuarter(q)}
            >
              {t(`dashboard.rubrics.quarter${q}`)}
            </button>
          ))}
        </div>

        <button
          className="eval-criteria-export-btn"
          onClick={handleExportGrades}
          disabled={exporting}
          title={t('dashboard.rubrics.exportGrades')}
        >
          {exporting ? (
            <Loader2 className="icon-spin" size={16} style={{ marginRight: '0.25rem' }} />
          ) : (
            <Download size={16} style={{ marginRight: '0.25rem' }} />
          )}
          {t('dashboard.rubrics.exportGrades')}
        </button>
      </div>

      {/* Table */}
      {classStudents.length === 0 ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty-text">{t('dashboard.students.noStudentsInClass')}</p>
        </div>
      ) : (
        <>
          {filteredExercises.length === 0 && (
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.75rem', textAlign: 'center' }}>
              {t('dashboard.rubrics.noExercises')}
            </div>
          )}
        <div className="eval-criteria-table-container">
          <div className="eval-criteria-table-wrapper">
            <table className="eval-criteria-table">
              <thead>
                <tr>
                  <th className="eval-criteria-student-col">{t('dashboard.rubrics.student')}</th>
                  {filteredExercises.map(ex => (
                    <th key={ex.id}>
                      <div className="eval-criteria-exercise-header">
                        <span className="eval-criteria-exercise-title">{ex.title}</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                          {ex.percentageGrade}% - {t('dashboard.rubrics.maxGrade')}: {ex.maxGrade}
                        </span>
                        <div className="eval-criteria-exercise-actions">
                          {ex.description && (
                            <EvalCriteriaTooltip text={ex.description}>
                              <Info size={14} />
                            </EvalCriteriaTooltip>
                          )}
                          <EvalCriteriaTooltip text={`${t('dashboard.rubrics.documents')} (${ex.documents.length})`} as="span">
                            <button
                              className="eval-criteria-exercise-btn"
                              onClick={() => setDocsModal({ exerciseId: ex.id, exerciseTitle: ex.title, documents: ex.documents })}
                              aria-label={t('dashboard.rubrics.documents')}
                            >
                              <FileText size={14} />
                              {ex.documents.length > 0 && (
                                <span style={{ fontSize: '0.65rem', marginLeft: '1px' }}>{ex.documents.length}</span>
                              )}
                            </button>
                          </EvalCriteriaTooltip>
                          <EvalCriteriaTooltip text={t('common.edit')} as="span">
                            <button
                              className="eval-criteria-exercise-btn"
                              onClick={() => setExerciseToEdit(ex)}
                              aria-label={t('common.edit')}
                            >
                              <Edit size={14} />
                            </button>
                          </EvalCriteriaTooltip>
                          <EvalCriteriaTooltip text={t('common.delete')} as="span">
                            <button
                              className="eval-criteria-exercise-btn delete"
                              onClick={() => setExerciseToDelete(ex)}
                              aria-label={t('common.delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </EvalCriteriaTooltip>
                        </div>
                      </div>
                    </th>
                  ))}
                  {filteredExercises.length > 0 && (
                    <th className="eval-criteria-total-col">
                      <div className="eval-criteria-exercise-header">
                        <span className="eval-criteria-exercise-title">{t('dashboard.rubrics.total')}</span>
                        <span style={{ fontSize: '0.7rem', color: totalPercentage > 100 ? '#dc2626' : '#9ca3af' }}>
                          {totalPercentage}% / 100%
                        </span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td className="eval-criteria-student-col">
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
                    {filteredExercises.map(ex => {
                      const gradeData = getStudentGrade(student.id, ex.id);
                      return (
                        <td key={ex.id}>
                          {gradeData ? (
                            <div className="eval-criteria-grade-cell">
                              {gradeData.grade < gradeData.maxGrade * 0.5 && (
                                <Frown size={18} style={{ color: '#f97316' }} />
                              )}
                              {gradeData.grade >= gradeData.maxGrade * 0.9 && (
                                <Smile size={18} style={{ color: '#eab308' }} />
                              )}
                              <span className="eval-criteria-grade-value">
                                {Number.isInteger(gradeData.grade) ? gradeData.grade : gradeData.grade.toFixed(2)} / {gradeData.maxGrade}
                              </span>
                              {gradeData.description && (
                                <EvalCriteriaTooltip text={gradeData.description} position="bottom">
                                  <Info size={13} />
                                </EvalCriteriaTooltip>
                              )}
                              {/* Documents button: always visible when has docs, hover-only when empty */}
                              <EvalCriteriaTooltip text={`${t('dashboard.rubrics.gradeDocuments')} (${gradeData.documents.length})`} as="span">
                                <button
                                  className={`eval-criteria-grade-btn${gradeData.documents.length === 0 ? ' eval-criteria-grade-hover-btn' : ''}`}
                                  onClick={() => setGradeDocsModal({
                                    gradeId: gradeData.gradeId,
                                    title: t('dashboard.rubrics.gradeDocumentsTitle')
                                      .replace('{student}', `${student.surnames}, ${student.name}`)
                                      .replace('{exercise}', ex.title),
                                    documents: gradeData.documents,
                                  })}
                                  aria-label={t('dashboard.rubrics.gradeDocuments')}
                                >
                                  <FileText size={12} />
                                  {gradeData.documents.length > 0 && (
                                    <span style={{ fontSize: '0.6rem', marginLeft: '1px' }}>{gradeData.documents.length}</span>
                                  )}
                                </button>
                              </EvalCriteriaTooltip>
                              <div className="eval-criteria-grade-actions-hover">
                                <EvalCriteriaTooltip text={t('common.edit')} as="span">
                                  <button
                                    className="eval-criteria-grade-btn eval-criteria-grade-hover-btn"
                                    onClick={() => setGradeModal({
                                      exerciseId: ex.id,
                                      maxGrade: ex.maxGrade,
                                      studentId: student.id,
                                      studentName: `${student.surnames}, ${student.name}`,
                                      existing: {
                                        gradeId: gradeData.gradeId,
                                        grade: gradeData.grade,
                                        description: gradeData.description,
                                      },
                                    })}
                                    aria-label={t('common.edit')}
                                  >
                                    <Edit size={12} />
                                  </button>
                                </EvalCriteriaTooltip>
                                <EvalCriteriaTooltip text={t('common.delete')} as="span">
                                  <button
                                    className="eval-criteria-grade-btn delete eval-criteria-grade-hover-btn"
                                    onClick={() => setGradeToDelete({ gradeId: gradeData.gradeId, exerciseTitle: ex.title })}
                                    aria-label={t('common.delete')}
                                  >
                                    <Trash size={12} />
                                  </button>
                                </EvalCriteriaTooltip>
                              </div>
                            </div>
                          ) : (
                            <EvalCriteriaTooltip text={t('dashboard.rubrics.createGrade')} as="span">
                              <button
                                className="eval-criteria-add-grade-btn"
                                onClick={() => setGradeModal({
                                  exerciseId: ex.id,
                                  maxGrade: ex.maxGrade,
                                  studentId: student.id,
                                  studentName: `${student.surnames}, ${student.name}`,
                                  existing: null,
                                })}
                              >
                                <Plus size={14} />
                              </button>
                            </EvalCriteriaTooltip>
                          )}
                        </td>
                      );
                    })}
                    {filteredExercises.length > 0 && (() => {
                      const finalGrade = calculateFinalGrade(student.id);
                      const isFailing = finalGrade !== null && finalGrade < 5;
                      return (
                        <td className={`eval-criteria-total-col ${isFailing ? 'eval-criteria-total-fail' : ''}`}>
                          {finalGrade === null ? (
                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>-</span>
                          ) : (
                            <span className="eval-criteria-grade-value" style={{ fontWeight: 700 }}>
                              {Number.isInteger(finalGrade) ? finalGrade : finalGrade.toFixed(2)} / 10
                            </span>
                          )}
                        </td>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}


      {/* Create Exercise Modal */}
      {selectedSubjectClassId > 0 && (
        <ExerciseFormModal
          isOpen={showExerciseForm}
          onClose={() => setShowExerciseForm(false)}
          onSuccess={handleExerciseCreated}
          subjectClassId={selectedSubjectClassId}
          quarterPreset={activeQuarter}
          usedPercentage={totalPercentage}
        />
      )}

      {/* Edit Exercise Modal */}
      {exerciseToEdit && selectedSubjectClassId > 0 && (
        <ExerciseFormModal
          isOpen={Boolean(exerciseToEdit)}
          onClose={() => setExerciseToEdit(null)}
          onSuccess={handleExerciseUpdated}
          subjectClassId={selectedSubjectClassId}
          quarterPreset={activeQuarter}
          exercise={exerciseToEdit}
          usedPercentage={totalPercentage - exerciseToEdit.percentageGrade}
        />
      )}

      {/* Grade Modal */}
      {gradeModal && (
        <GradeFormModal
          isOpen={Boolean(gradeModal)}
          onClose={() => setGradeModal(null)}
          onSuccess={handleGradeSuccess}
          exerciseId={gradeModal.exerciseId}
          maxGrade={gradeModal.maxGrade}
          studentId={gradeModal.studentId}
          studentName={gradeModal.studentName}
          existingGrade={gradeModal.existing}
        />
      )}

      {/* Documents Modal */}
      {docsModal && (
        <DocumentsModal
          isOpen={Boolean(docsModal)}
          onClose={() => setDocsModal(null)}
          exerciseId={docsModal.exerciseId}
          exerciseTitle={docsModal.exerciseTitle}
          documents={docsModal.documents}
          onDocumentsChanged={handleDocumentsChanged}
        />
      )}

      {/* Grade Documents Modal */}
      {gradeDocsModal && (
        <GradeDocumentsModal
          isOpen={Boolean(gradeDocsModal)}
          onClose={() => setGradeDocsModal(null)}
          gradeId={gradeDocsModal.gradeId}
          title={gradeDocsModal.title}
          documents={gradeDocsModal.documents}
          onDocumentsChanged={handleGradeDocumentsChanged}
        />
      )}

      {/* Delete Exercise Confirm */}
      {exerciseToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(exerciseToDelete)}
          title={t('dashboard.rubrics.deleteExerciseTitle')}
          itemName={exerciseToDelete.title}
          confirmMessage={t('dashboard.rubrics.deleteExerciseConfirm')}
          onConfirm={handleDeleteExercise}
          onCancel={() => setExerciseToDelete(null)}
          isDeleting={deleting}
        />
      )}

      {/* Delete Grade Confirm */}
      {gradeToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(gradeToDelete)}
          title={t('dashboard.rubrics.deleteGradeTitle')}
          itemName={gradeToDelete.exerciseTitle}
          confirmMessage={t('dashboard.rubrics.deleteGradeConfirm')}
          onConfirm={handleDeleteGrade}
          onCancel={() => setGradeToDelete(null)}
          isDeleting={deleting}
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
    </div>
  );
}


