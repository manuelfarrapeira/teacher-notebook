import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, CalendarDays } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { AbsenceService, Absence } from '../../services/AbsenceService';
import { ApiErrorException } from '../../services/BaseService';

/**
 * Props for StudentAbsencesModal
 */
interface StudentAbsencesModalProps {
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

/** Group of absences for a single subject */
interface SubjectAbsenceGroup {
  subjectId: number;
  subjectName: string;
  dates: string[];
}


/**
 * Modal that displays a summary of all absences for a single student.
 * Shows: total count, breakdown by subject, and breakdown by month.
 */
export function StudentAbsencesModal({
  isOpen,
  onClose,
  classId,
  studentId,
  studentName,
}: StudentAbsencesModalProps) {
  const { t } = useI18n();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAbsences = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await AbsenceService.getStudentAbsences(classId, studentId);
        setAbsences(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err instanceof ApiErrorException) {
          setError(err.apiError.detail || err.apiError.description || t('dashboard.attendance.summaryError'));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('dashboard.attendance.summaryError'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAbsences();
  }, [isOpen, classId, studentId, t]);

  /** Group absences by subject */
  const bySubject = useMemo((): SubjectAbsenceGroup[] => {
    const map = new Map<number, SubjectAbsenceGroup>();
    for (const a of absences) {
      let group = map.get(a.subjectId);
      if (!group) {
        group = { subjectId: a.subjectId, subjectName: a.subjectName, dates: [] };
        map.set(a.subjectId, group);
      }
      group.dates.push(a.absenceDate);
    }
    return Array.from(map.values()).sort((a, b) => b.dates.length - a.dates.length);
  }, [absences]);


  if (!isOpen) return null;

  return (
    <dialog className="modal-overlay" open>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: '550px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="modal-title" style={{ margin: 0 }}>
              {t('dashboard.attendance.summaryTitle')}
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
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && (
              <div className="loading-center">
                <Loader2 className="icon-spin" size={28} />
              </div>
            )}

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
            )}

            {!loading && !error && absences.length === 0 && (
              <div className="dashboard-empty">
                <CalendarDays className="dashboard-empty-icon" />
                <p className="dashboard-empty-text">{t('dashboard.attendance.noAbsences')}</p>
              </div>
            )}

            {!loading && !error && absences.length > 0 && (
              <>
                {/* Total */}
                <div className="absence-summary-total">
                  <span className="absence-summary-total-label">{t('dashboard.attendance.totalAbsences')}</span>
                  <span className="absence-summary-total-value">{absences.length}</span>
                </div>

                {/* By Subject */}
                <div className="absence-summary-section">
                  <h4 className="absence-summary-section-title">{t('dashboard.attendance.bySubject')}</h4>
                  <div className="absence-summary-list">
                    {bySubject.map((group) => (
                      <div key={group.subjectId} className="absence-summary-row">
                        <span className="absence-summary-row-label">{group.subjectName}</span>
                        <span className="absence-summary-row-value">{group.dates.length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
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

