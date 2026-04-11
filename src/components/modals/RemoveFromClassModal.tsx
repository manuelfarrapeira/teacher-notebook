import React from 'react';
import { Loader2, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import type { Student, School } from '../../domain/models';

interface RemoveFromClassModalProps {
  /** The student to remove from class */
  student: Student;
  /** The class ID to remove the student from */
  classId: number;
  /** List of schools (used to resolve class info) */
  schools: School[];
  /** Whether the removal operation is in progress */
  isRemoving: boolean;
  /** Callback to confirm the removal */
  onConfirm: () => void;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Modal to confirm removing a student from a class
 */
export function RemoveFromClassModal({
  student,
  classId,
  schools,
  isRemoving,
  onConfirm,
  onClose,
}: Readonly<RemoveFromClassModalProps>) {
  const { t } = useI18n();

  const classInfo = schools
    .flatMap(school =>
      school.classes.map(cls => ({
        ...cls,
        schoolName: school.name,
      }))
    )
    .find(cls => cls.id === classId);

  const className = classInfo ? `${classInfo.name} (${classInfo.schoolYear})` : '';
  const studentName = `${student.name} ${student.surnames}`;
  const message = t('dashboard.students.confirmRemoveMessage')
    .replace('{studentName}', studentName)
    .replace('{className}', className);

  return (
    <dialog className="modal-overlay" open={true} aria-label={t('dashboard.students.removeFromClassTitle')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="modal-title">{t('dashboard.students.removeFromClassTitle')}</h3>
            <button
              onClick={onClose}
              className="modal-button cancel"
              style={{ padding: '0.5rem', minWidth: 'auto' }}
              aria-label={t('common.close')}
              disabled={isRemoving}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', marginBottom: '1rem' }}>
              {message}
            </p>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontWeight: 600, color: '#991b1b', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                {studentName}
              </p>
              {classInfo && (
                <>
                  <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: '0.25rem 0' }}>
                    <strong>{t('dashboard.students.school')}:</strong> {classInfo.schoolName}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: '0.25rem 0 0 0' }}>
                    <strong>{t('dashboard.students.class')}:</strong> {classInfo.name} - {classInfo.schoolYear}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={onClose}
              className="modal-button cancel"
              disabled={isRemoving}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="modal-button save"
              style={{ backgroundColor: '#dc2626' }}
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="animate-spin" size={16} />}
              {t('dashboard.students.confirmRemove')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}


