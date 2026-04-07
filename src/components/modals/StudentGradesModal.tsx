import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Frown, Smile, ChevronDown, FileText, Download, Radar, Users } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { ExerciseService, StudentQuarter, GradeExercise } from '../../infrastructure/api/ExerciseService';
import { SubjectService, ClassSubject } from '../../infrastructure/api/SubjectService';
import { GroupAssignmentService } from '../../infrastructure/api/GroupAssignmentService';
import { StudentGroupService } from '../../infrastructure/api/StudentGroupService';
import type { GroupAssignment, GroupAssignmentGrade, SavedGroup } from '../../domain/models';
import { PortalTooltip } from '../ui/PortalTooltip';
import { StudentRadarChartModal } from './StudentRadarChartModal';

/**
 * Props for StudentGradesModal
 */
interface StudentGradesModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Class ID */
  readonly classId: number;
  /** Student ID */
  readonly studentId: number;
  /** Student full name */
  readonly studentName: string;
}

/**
 * Calculate the weighted average (over 10) for exercises in a subject.
 * Each exercise contributes: (grade / maxGrade) * (percentageGrade / 100) * 10
 * Missing percentage counts as 0.
 */
function calculateSubjectAverage(exercises: GradeExercise[]): number {
  if (exercises.length === 0) return 0;
  let weightedSum = 0;
  for (const ex of exercises) {
    weightedSum += (ex.grade / ex.maxGrade) * (ex.percentageGrade / 100) * 10;
  }
  return Math.round(weightedSum * 100) / 100;
}

/**
 * Format a grade value: show decimals only if not an integer.
 */
function formatGrade(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Modal that displays all grades for a single student across quarters and subjects.
 * Has tabs for each quarter + a "Final Grade" tab.
 */
export function StudentGradesModal({
  isOpen,
  onClose,
  classId,
  studentId,
  studentName,
}: StudentGradesModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [quarters, setQuarters] = useState<StudentQuarter[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<number | 'final'>(1);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedDocs, setExpandedDocs] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState<number | null>(null);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [radarChartOpen, setRadarChartOpen] = useState(false);

  /** Group work state */
  const [groupAssignments, setGroupAssignments] = useState<GroupAssignment[]>([]);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [groupGradesMap, setGroupGradesMap] = useState<Record<number, GroupAssignmentGrade[]>>({});

  /** Toggle the document list for a grade row */
  const toggleDocs = (gradeId: number) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(gradeId)) { next.delete(gradeId); } else { next.add(gradeId); }
      return next;
    });
  };

  /** Download a single grade document */
  const handleDownload = async (gradeId: number, docId: number, fileName: string) => {
    setDownloading(docId);
    try {
      const blob = await ExerciseService.downloadGradeDocument(gradeId, docId);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  /** Toggle a subject accordion. Key is `quarter-subjectId` */
  const toggleSubject = (quarter: number, subjectId: number) => {
    const key = `${quarter}-${subjectId}`;
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isOpen && classId && studentId) {
      setLoading(true);
      setError('');
      setActiveTab(1);
      setRadarChartOpen(false);
      Promise.all([
        ExerciseService.getStudentGrades(classId, studentId),
        SubjectService.getClassSubjects(classId),
        GroupAssignmentService.getByClass(classId),
        StudentGroupService.getSavedGroups(classId),
      ])
        .then(async ([gradesData, subjectsData, assignmentsData, groupsData]) => {
          const sorted = [...gradesData].sort((a, b) => a.quarter - b.quarter);
          setQuarters(sorted);
          setClassSubjects(subjectsData);
          setGroupAssignments(assignmentsData);
          setSavedGroups(groupsData);
          if (sorted.length > 0) {
            setActiveTab(sorted[0].quarter);
          }
          // Fetch grades for all assignments
          const gradesEntries: Record<number, GroupAssignmentGrade[]> = {};
          await Promise.all(
            assignmentsData.map(async (a) => {
              try {
                const grades = await GroupAssignmentService.getGrades(a.id);
                gradesEntries[a.id] = grades;
              } catch {
                gradesEntries[a.id] = [];
              }
            })
          );
          setGroupGradesMap(gradesEntries);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : t('dashboard.evalCriteria.loadError'));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, classId, studentId]);

  /** Get the active quarter data */
  const activeQuarterData = useMemo(() => {
    if (activeTab === 'final') return null;
    return quarters.find(q => q.quarter === activeTab) ?? null;
  }, [quarters, activeTab]);

  /**
   * Final grade per subject: average of the 3 quarter averages / 3.
   * Collects all unique subjects across all quarters, then for each
   * calculates the average of its quarter averages.
   */
  const finalGrades = useMemo(() => {
    const subjectMap = new Map<number, { subjectName: string; quarterAverages: number[] }>();

    for (const q of quarters) {
      for (const sub of q.subjects) {
        let entry = subjectMap.get(sub.subjectId);
        if (!entry) {
          entry = { subjectName: sub.subjectName, quarterAverages: [] };
          subjectMap.set(sub.subjectId, entry);
        }
        entry.quarterAverages.push(calculateSubjectAverage(sub.exercises));
      }
    }

    const results: { subjectId: number; subjectName: string; quarterAverages: number[]; finalAverage: number | null }[] = [];
    subjectMap.forEach((val, key) => {
      const count = val.quarterAverages.length;
      const finalAverage = count > 0
        ? Math.round((val.quarterAverages.reduce((a, b) => a + b, 0) / count) * 100) / 100
        : null;
      results.push({ subjectId: key, subjectName: val.subjectName, quarterAverages: val.quarterAverages, finalAverage });
    });

    return results;
  }, [quarters]);

  /**
   * Find which saved group the student belongs to.
   * Returns the group or null if the student is not in any group.
   */
  const studentGroup = useMemo(() => {
    return savedGroups.find(g => g.members.some(m => m.studentId === studentId)) ?? null;
  }, [savedGroups, studentId]);

  /**
   * Group work data: for each assignment, find the grade for the student's group.
   * Sorted by quarter, then by title.
   */
  const groupWorkData = useMemo(() => {
    if (!studentGroup) return [];
    return groupAssignments
      .map(a => {
        const grades = groupGradesMap[a.id] ?? [];
        const gradeEntry = grades.find(g => g.groupId === studentGroup.id);
        return {
          assignmentId: a.id,
          title: a.title,
          description: a.description,
          quarter: a.quarter,
          groupName: studentGroup.name,
          grade: gradeEntry?.grade ?? null,
        };
      })
      .sort((a, b) => a.quarter - b.quarter || a.title.localeCompare(b.title));
  }, [groupAssignments, groupGradesMap, studentGroup]);

  if (!isOpen) return null;

  const title = t('dashboard.evalCriteria.studentGradesTitle').replace('{name}', studentName);

  /** Render a quarter's subjects and exercises (accordion) */
  const renderQuarterContent = (quarterData: StudentQuarter) => (
    <>
      {quarterData.subjects.map(subject => {
        const subjectAvg = calculateSubjectAverage(subject.exercises);
        const key = `${quarterData.quarter}-${subject.subjectId}`;
        const isExpanded = expandedSubjects.has(key);
        return (
          <div key={subject.subjectId} style={{ marginBottom: '0.5rem' }}>
            <button
              className="student-grades-subject-header student-grades-accordion-btn"
              onClick={() => toggleSubject(quarterData.quarter, subject.subjectId)}
              type="button"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronDown
                  size={16}
                  style={{
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}
                />
                {subject.subjectName}
              </span>
              <span className="student-grades-avg">
                {t('dashboard.evalCriteria.subjectAverage')}: {formatGrade(subjectAvg)} / 10
              </span>
            </button>

            {isExpanded && (
              <table className="student-grades-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>{t('dashboard.evalCriteria.exerciseTitle')}</th>
                    <th>{t('dashboard.evalCriteria.grade')}</th>
                    <th>%</th>
                    <th>{t('dashboard.evalCriteria.gradeDocuments')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.exercises.map(ex => {
                    const pct = ex.maxGrade > 0 ? (ex.grade / ex.maxGrade) : 0;
                    const hasDocuments = ex.documents.length > 0;
                    const docsExpanded = expandedDocs.has(ex.gradeId);
                    return (
                      <React.Fragment key={ex.gradeId}>
                        <tr>
                          <td style={{ textAlign: 'left' }}>
                            {ex.exerciseTitle}
                            {ex.description && (
                              <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                - {ex.description}
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              {pct < 0.5 && <Frown size={14} style={{ color: '#f97316' }} />}
                              {pct >= 0.9 && <Smile size={14} style={{ color: '#eab308' }} />}
                              {formatGrade(ex.grade)} / {ex.maxGrade}
                            </span>
                          </td>
                          <td>{ex.percentageGrade}%</td>
                          <td>
                            {hasDocuments && (
                              <PortalTooltip text={`${t('dashboard.evalCriteria.gradeDocuments')} (${ex.documents.length})`} as="span">
                                <button
                                  className="eval-criteria-exercise-btn"
                                  onClick={() => toggleDocs(ex.gradeId)}
                                  aria-label={t('dashboard.evalCriteria.gradeDocuments')}
                                  style={{ color: docsExpanded ? '#2c5f4a' : undefined }}
                                >
                                  <FileText size={14} />
                                  <span style={{ fontSize: '0.7rem', marginLeft: '2px' }}>{ex.documents.length}</span>
                                </button>
                              </PortalTooltip>
                            )}
                          </td>
                        </tr>
                        {hasDocuments && docsExpanded && (
                          <tr>
                            <td colSpan={4} style={{ padding: '0.25rem 0.5rem 0.5rem 1rem', background: '#f9fafb' }}>
                              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                <colgroup>
                                  <col style={{ width: '26px' }} />
                                  <col />
                                  <col style={{ width: '40%' }} />
                                </colgroup>
                                <tbody>
                                  {ex.documents.map(doc => (
                                    <tr key={doc.id}>
                                      <td style={{ verticalAlign: 'middle', textAlign: 'left', padding: '0.1rem 0.25rem 0.1rem 0' }}>
                                        <PortalTooltip text={t('dashboard.evalCriteria.downloadDocument')} as="span">
                                          <button
                                            className="eval-criteria-exercise-btn"
                                            onClick={() => handleDownload(ex.gradeId, doc.id, doc.document)}
                                            disabled={downloading === doc.id}
                                            aria-label={t('dashboard.evalCriteria.downloadDocument')}
                                          >
                                            {downloading === doc.id
                                              ? <Loader2 size={13} className="icon-spin" />
                                              : <Download size={13} />}
                                          </button>
                                        </PortalTooltip>
                                      </td>
                                      <td
                                        style={{ verticalAlign: 'middle', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#3d4440', padding: '0.1rem 0.4rem 0.1rem 0' }}
                                        title={doc.document}
                                      >
                                        {doc.document}
                                      </td>
                                      <td style={{ verticalAlign: 'middle', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#9ca3af', padding: '0.1rem 0' }}>
                                        {doc.description || ''}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      {quarterData.subjects.length === 0 && (
        <div className="dashboard-empty" style={{ padding: '1.5rem' }}>
          <p className="dashboard-empty-text">{t('dashboard.evalCriteria.noGradesForStudent')}</p>
        </div>
      )}
      {renderGroupWorkForQuarter(quarterData.quarter)}
    </>
  );

  const getFinalCellBg = (isFailing: boolean, finalAverage: number | null): string => {
    if (isFailing) return '#fecaca';
    if (finalAverage === null) return 'transparent';
    return '#e8e4f3';
  };

  /** Render the final grade tab */
  const renderFinalGrade = () => (
    <>
      {finalGrades.length === 0 ? (
        <div className="dashboard-empty" style={{ padding: '1.5rem' }}>
          <p className="dashboard-empty-text">{t('dashboard.evalCriteria.noGradesForStudent')}</p>
        </div>
      ) : (
        <table className="student-grades-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>{t('dashboard.schedule.subject')}</th>
              <th>{t('dashboard.evalCriteria.quarter1')}</th>
              <th>{t('dashboard.evalCriteria.quarter2')}</th>
              <th>{t('dashboard.evalCriteria.quarter3')}</th>
              <th>{t('dashboard.evalCriteria.finalGrade')}</th>
            </tr>
          </thead>
          <tbody>
            {finalGrades.map(fg => {
              const isFailing = fg.finalAverage !== null && fg.finalAverage < 5;
              const finalCellBg = getFinalCellBg(isFailing, fg.finalAverage);
              return (
                <tr key={fg.subjectId}>
                  <td style={{ textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{fg.subjectName}</td>
                  {[0, 1, 2].map(i => (
                    <td key={i}>
                      {fg.quarterAverages[i] === undefined ? '-' : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {fg.quarterAverages[i] < 5 && <Frown size={13} style={{ color: '#f97316' }} />}
                          {fg.quarterAverages[i] >= 9 && <Smile size={13} style={{ color: '#eab308' }} />}
                          {formatGrade(fg.quarterAverages[i])}
                        </span>
                      )}
                    </td>
                  ))}
                  <td style={{ fontWeight: 700, background: finalCellBg }}>
                    {fg.finalAverage === null ? '-' : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isFailing && <Frown size={14} style={{ color: '#f97316' }} />}
                        {fg.finalAverage >= 9 && <Smile size={14} style={{ color: '#eab308' }} />}
                        {formatGrade(fg.finalAverage)} / 10
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );

  /** Render group work grades for a specific quarter, shown below subject grades */
  const renderGroupWorkForQuarter = (quarter: number) => {
    const quarterAssignments = groupWorkData.filter(gw => gw.quarter === quarter);
    if (quarterAssignments.length === 0) return null;

    return (
      <div style={{ marginTop: '1rem', borderTop: '1px solid #E3DED6', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Users size={16} style={{ color: '#2c5f4a' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#3d4440' }}>
            {t('dashboard.evalCriteria.groupWork.title')}
          </span>
          {studentGroup && (
            <span style={{ fontSize: '0.8rem', color: '#7a8078' }}>
              — {studentGroup.name}
            </span>
          )}
        </div>
        <table className="student-grades-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{t('dashboard.evalCriteria.groupWork.assignment')}</th>
              <th>{t('dashboard.evalCriteria.groupWork.grade')}</th>
            </tr>
          </thead>
          <tbody>
            {quarterAssignments.map(gw => {
              const isFailing = gw.grade !== null && gw.grade < 5;
              const isExcellent = gw.grade !== null && gw.grade >= 9;
              const gradeBg = gw.grade === null ? 'transparent' : (isFailing ? '#fecaca' : '#e8e4f3');
              return (
                <tr key={gw.assignmentId}>
                  <td style={{ textAlign: 'left' }}>
                    {gw.title}
                    {gw.description && (
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                        - {gw.description}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, background: gradeBg }}>
                    {gw.grade === null ? (
                      <span style={{ color: '#9ca3af', fontWeight: 400 }}>{t('dashboard.evalCriteria.groupWork.noGrade')}</span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isFailing && <Frown size={14} style={{ color: '#f97316' }} />}
                        {isExcellent && <Smile size={14} style={{ color: '#eab308' }} />}
                        {formatGrade(gw.grade)} / 10
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <dialog className="modal-overlay" open={isOpen} aria-label={title}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '850px', width: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>{title}</h3>
              <button
                onClick={onClose}
                className="modal-button cancel"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quarter Tabs */}
            {!loading && !error && quarters.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div className="eval-criteria-quarter-tabs" style={{ marginBottom: 0, marginLeft: 0 }}>
                  {[1, 2, 3].map(q => (
                    <button
                      key={q}
                      className={`eval-criteria-quarter-tab ${activeTab === q ? 'active' : ''}`}
                      onClick={() => setActiveTab(q)}
                    >
                      {t(`dashboard.evalCriteria.quarter${q}`)}
                    </button>
                  ))}
                  <button
                    className={`eval-criteria-quarter-tab ${activeTab === 'final' ? 'active' : ''}`}
                    onClick={() => setActiveTab('final')}
                  >
                    {t('dashboard.evalCriteria.finalGrade')}
                  </button>
                </div>
                {classSubjects.length > 0 && (
                  <PortalTooltip text={t('dashboard.evalCriteria.radarChart.title')} as="span">
                    <button
                      className="eval-criteria-exercise-btn"
                      onClick={() => setRadarChartOpen(true)}
                      aria-label={t('dashboard.evalCriteria.radarChart.title')}
                      style={{ padding: '0.4rem' }}
                    >
                      <Radar size={18} />
                    </button>
                  </PortalTooltip>
                )}
              </div>
            )}

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading && (
                <div className="loading-center" style={{ padding: '2rem' }}>
                  <Loader2 className="icon-spin" size={28} />
                </div>
              )}

              {Boolean(error) && (
                <div style={{ color: '#dc2626', fontSize: '0.875rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {!loading && !error && quarters.length === 0 && (
                <div className="dashboard-empty" style={{ padding: '2rem' }}>
                  <p className="dashboard-empty-text">{t('dashboard.evalCriteria.noGradesForStudent')}</p>
                </div>
              )}

              {!loading && !error && activeTab !== 'final' && activeQuarterData && (
                renderQuarterContent(activeQuarterData)
              )}

              {!loading && !error && activeTab !== 'final' && !activeQuarterData && quarters.length > 0 && (
                <div className="dashboard-empty" style={{ padding: '1.5rem' }}>
                  <p className="dashboard-empty-text">{t('dashboard.evalCriteria.noGradesForStudent')}</p>
                </div>
              )}

              {!loading && !error && activeTab === 'final' && (
                renderFinalGrade()
              )}
            </div>
          </div>
        </div>
      </dialog>

      {radarChartOpen && (
        <StudentRadarChartModal
          isOpen={radarChartOpen}
          onClose={() => setRadarChartOpen(false)}
          studentName={studentName}
          classSubjects={classSubjects.map(cs => ({ subjectId: cs.subjectId, subjectName: cs.subjectName }))}
          subjectGrades={finalGrades.map(fg => ({
            subjectId: fg.subjectId,
            subjectName: fg.subjectName,
            quarterAverages: [
              fg.quarterAverages[0] ?? null,
              fg.quarterAverages[1] ?? null,
              fg.quarterAverages[2] ?? null,
            ],
            finalAverage: fg.finalAverage,
          }))}
        />
      )}
    </>
  );
}
