import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, GraduationCap, ClipboardList } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import {
  ClassRubricService,
  ClassRubric,
  StudentCriterionAssignment,
} from '../../infrastructure/api/ClassRubricService';
import { ApiErrorException } from '../../infrastructure/api/BaseService';

/**
 * Props for StudentRubricCriteriaModal
 */
interface StudentRubricCriteriaModalProps {
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

/** Grouped criterion with skill info */
interface SkillGroup {
  skillId: number;
  skillTitle: string;
  rubrics: RubricGroup[];
}

/** Grouped rubric with its assigned criterion */
interface RubricGroup {
  rubricId: number;
  rubricTitle: string;
  criterion: {
    description: string;
    gradeStart: number;
    gradeEnd: number;
  };
}

/**
 * Modal that displays a summary of all rubric criteria assigned to a student,
 * grouped by skill (competencia) and rubric.
 */
export function StudentRubricCriteriaModal({
  isOpen,
  onClose,
  classId,
  studentId,
  studentName,
}: StudentRubricCriteriaModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentCriteria, setStudentCriteria] = useState<StudentCriterionAssignment[]>([]);
  const [classRubrics, setClassRubrics] = useState<ClassRubric[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [criteriaData, rubricsData] = await Promise.all([
          ClassRubricService.getStudentCriteria(classId, studentId),
          ClassRubricService.getClassRubrics(classId),
        ]);
        const firstGroup = Array.isArray(criteriaData) && criteriaData.length > 0
          ? criteriaData[0]
          : null;
        setStudentCriteria(
          firstGroup && Array.isArray(firstGroup.rubricCriteria)
            ? firstGroup.rubricCriteria
            : [],
        );
        setClassRubrics(Array.isArray(rubricsData) ? rubricsData : []);
      } catch (err) {
        if (err instanceof ApiErrorException) {
          setError(err.apiError.detail || err.apiError.description || t('dashboard.classRubrics.loadError'));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('dashboard.classRubrics.loadError'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, classId, studentId, t]);

  /** Build a map from classRubricId → { skillId, rubricTitle } using classRubrics */
  const classRubricMap = useMemo(() => {
    const map = new Map<number, { skillId: number; rubricTitle: string }>();
    for (const cr of classRubrics) {
      map.set(cr.id, { skillId: cr.skillId, rubricTitle: cr.rubricTitle });
    }
    return map;
  }, [classRubrics]);

  /** Build a map from skillId → skillTitle using SkillService data embedded in classRubrics */
  // We don't have skill title from classRubrics, so we'll need to fetch skills.
  // But to keep it simple, we'll use the rubric.title from the studentCriteria assignments.

  /** Group criteria by skill → rubrics */
  const skillGroups: SkillGroup[] = useMemo(() => {
    if (studentCriteria.length === 0 || classRubrics.length === 0) return [];

    // Build skillId → skillTitle map from classRubrics + skills
    // classRubrics has skillId but no skillTitle, so we need to group and label later
    const skillMap = new Map<number, SkillGroup>();

    for (const assignment of studentCriteria) {
      const crInfo = classRubricMap.get(assignment.classRubricId);
      if (!crInfo) continue;

      const { skillId } = crInfo;

      let skillGroup = skillMap.get(skillId);
      if (!skillGroup) {
        skillGroup = {
          skillId,
          skillTitle: '', // Will be resolved below
          rubrics: [],
        };
        skillMap.set(skillId, skillGroup);
      }

      skillGroup.rubrics.push({
        rubricId: assignment.rubric.id,
        rubricTitle: assignment.rubric.title,
        criterion: {
          description: assignment.criterion.description,
          gradeStart: assignment.criterion.gradeStart,
          gradeEnd: assignment.criterion.gradeEnd,
        },
      });
    }

    return Array.from(skillMap.values());
  }, [studentCriteria, classRubrics, classRubricMap]);

  /** Resolve skill titles: fetch skills once to get titles */
  const [skillTitles, setSkillTitles] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (!isOpen || classRubrics.length === 0) return;
    // Import dynamically to avoid circular deps
    import('../../infrastructure/api/SkillService').then(({ SkillService }) => {
      SkillService.getSkills().then(skills => {
        const map = new Map<number, string>();
        for (const s of skills) {
          map.set(s.id, s.title);
        }
        setSkillTitles(map);
      }).catch(() => {
        // Ignore - will just show "Skill X"
      });
    });
  }, [isOpen, classRubrics]);

  /** Resolved skill groups with titles */
  const resolvedGroups = useMemo(() => {
    return skillGroups.map(g => ({
      ...g,
      skillTitle: skillTitles.get(g.skillId) || `${t('dashboard.classRubrics.skill')} ${g.skillId}`,
    }));
  }, [skillGroups, skillTitles, t]);

  if (!isOpen) return null;

  return (
    <dialog className="modal-overlay" open>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: '950px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="modal-title" style={{ margin: 0 }}>
              {t('dashboard.classRubrics.studentCriteriaSummary')}
            </h3>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a8078', display: 'flex', alignItems: 'center' }}
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Student name */}
          <p style={{ fontWeight: 600, fontSize: '1rem', color: '#2c5f4a', marginBottom: '1rem' }}>
            {studentName}
          </p>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading && (
              <div className="loading-center">
                <Loader2 className="icon-spin" size={28} />
              </div>
            )}

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
            )}

            {!loading && !error && studentCriteria.length === 0 && (
              <div className="dashboard-empty">
                <ClipboardList className="dashboard-empty-icon" />
                <p className="dashboard-empty-text">{t('dashboard.classRubrics.noCriteriaForStudent')}</p>
              </div>
            )}

            {!loading && !error && resolvedGroups.length > 0 && (
              <div className="student-criteria-summary-groups">
                {resolvedGroups.map(skillGroup => (
                  <div key={skillGroup.skillId} className="student-criteria-summary-skill">
                    {/* Skill header */}
                    <div className="student-criteria-summary-skill-header">
                      <GraduationCap size={18} style={{ flexShrink: 0 }} />
                      <span>{skillGroup.skillTitle}</span>
                    </div>

                    {/* Rubrics */}
                    <div className="student-criteria-summary-rubrics">
                      {skillGroup.rubrics.map((rubric, idx) => (
                        <div key={`${rubric.rubricId}-${idx}`} className="student-criteria-summary-rubric">
                          <div className="student-criteria-summary-rubric-header">
                            <span className="student-criteria-summary-rubric-title">{rubric.rubricTitle}</span>
                          </div>
                          <div className="student-criteria-summary-criterion">
                            <span className="student-criteria-summary-badge">
                              {rubric.criterion.gradeStart}–{rubric.criterion.gradeEnd}
                            </span>
                            <span className="student-criteria-summary-desc">
                              {rubric.criterion.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button className="modal-button cancel" onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

