import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Frown, Smile, ChevronDown } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { ExerciseService, StudentQuarter, GradeExercise } from '../../services/ExerciseService';

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
      ExerciseService.getStudentGrades(classId, studentId)
        .then(data => {
          const sorted = [...data].sort((a, b) => a.quarter - b.quarter);
          setQuarters(sorted);
          // Default to first available quarter
          if (sorted.length > 0) {
            setActiveTab(sorted[0].quarter);
          }
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : t('dashboard.rubrics.loadError'));
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

    const results: { subjectId: number; subjectName: string; quarterAverages: number[]; finalAverage: number }[] = [];
    subjectMap.forEach((val, key) => {
      // Sum of all quarter averages divided by 3 (always 3 quarters)
      const sum = val.quarterAverages.reduce((a, b) => a + b, 0);
      const finalAverage = Math.round((sum / 3) * 100) / 100;
      results.push({ subjectId: key, subjectName: val.subjectName, quarterAverages: val.quarterAverages, finalAverage });
    });

    return results;
  }, [quarters]);

  if (!isOpen) return null;

  const title = t('dashboard.rubrics.studentGradesTitle').replace('{name}', studentName);

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
                {t('dashboard.rubrics.subjectAverage')}: {formatGrade(subjectAvg)} / 10
              </span>
            </button>

            {isExpanded && (
              <table className="student-grades-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>{t('dashboard.rubrics.exerciseTitle')}</th>
                    <th>{t('dashboard.rubrics.grade')}</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.exercises.map(ex => {
                    const pct = ex.maxGrade > 0 ? (ex.grade / ex.maxGrade) : 0;
                    return (
                      <tr key={ex.gradeId}>
                        <td style={{ textAlign: 'left' }}>
                          {ex.exerciseTitle}
                          {ex.description && (
                            <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                              — {ex.description}
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
                      </tr>
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
          <p className="dashboard-empty-text">{t('dashboard.rubrics.noGradesForStudent')}</p>
        </div>
      )}
    </>
  );

  /** Render the final grade tab */
  const renderFinalGrade = () => (
    <>
      {finalGrades.length === 0 ? (
        <div className="dashboard-empty" style={{ padding: '1.5rem' }}>
          <p className="dashboard-empty-text">{t('dashboard.rubrics.noGradesForStudent')}</p>
        </div>
      ) : (
        <table className="student-grades-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>{t('dashboard.schedule.subject')}</th>
              <th>{t('dashboard.rubrics.quarter1')}</th>
              <th>{t('dashboard.rubrics.quarter2')}</th>
              <th>{t('dashboard.rubrics.quarter3')}</th>
              <th>{t('dashboard.rubrics.finalGrade')}</th>
            </tr>
          </thead>
          <tbody>
            {finalGrades.map(fg => {
              const isFailing = fg.finalAverage < 5;
              return (
                <tr key={fg.subjectId}>
                  <td style={{ textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{fg.subjectName}</td>
                  {[0, 1, 2].map(i => (
                    <td key={i}>
                      {fg.quarterAverages[i] !== undefined ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {fg.quarterAverages[i] < 5 && <Frown size={13} style={{ color: '#f97316' }} />}
                          {fg.quarterAverages[i] >= 9 && <Smile size={13} style={{ color: '#eab308' }} />}
                          {formatGrade(fg.quarterAverages[i])}
                        </span>
                      ) : '—'}
                    </td>
                  ))}
                  <td style={{ fontWeight: 700, background: isFailing ? '#fecaca' : '#e8e4f3' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {isFailing && <Frown size={14} style={{ color: '#f97316' }} />}
                      {fg.finalAverage >= 9 && <Smile size={14} style={{ color: '#eab308' }} />}
                      {formatGrade(fg.finalAverage)} / 10
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );

  return (
    <dialog className="modal-overlay" open={isOpen} aria-label={title}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="modal-content" style={{ maxWidth: '750px', width: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
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
            <div className="rubrics-quarter-tabs" style={{ marginBottom: '1rem', marginLeft: 0 }}>
              {[1, 2, 3].map(q => (
                <button
                  key={q}
                  className={`rubrics-quarter-tab ${activeTab === q ? 'active' : ''}`}
                  onClick={() => setActiveTab(q)}
                >
                  {t(`dashboard.rubrics.quarter${q}`)}
                </button>
              ))}
              <button
                className={`rubrics-quarter-tab ${activeTab === 'final' ? 'active' : ''}`}
                onClick={() => setActiveTab('final')}
              >
                {t('dashboard.rubrics.finalGrade')}
              </button>
            </div>
          )}

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div className="loading-center" style={{ padding: '2rem' }}>
                <Loader2 className="icon-spin" size={28} />
              </div>
            )}

            {error && (
              <div style={{ color: '#dc2626', fontSize: '0.875rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {!loading && !error && quarters.length === 0 && (
              <div className="dashboard-empty" style={{ padding: '2rem' }}>
                <p className="dashboard-empty-text">{t('dashboard.rubrics.noGradesForStudent')}</p>
              </div>
            )}

            {!loading && !error && quarters.length > 0 && activeTab !== 'final' && activeQuarterData && (
              renderQuarterContent(activeQuarterData)
            )}

            {!loading && !error && quarters.length > 0 && activeTab !== 'final' && !activeQuarterData && (
              <div className="dashboard-empty" style={{ padding: '1.5rem' }}>
                <p className="dashboard-empty-text">{t('dashboard.rubrics.noGradesForStudent')}</p>
              </div>
            )}

            {!loading && !error && quarters.length > 0 && activeTab === 'final' && (
              renderFinalGrade()
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
