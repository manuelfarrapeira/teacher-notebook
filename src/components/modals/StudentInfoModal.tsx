import React from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import type { Student } from '../../domain/models';

interface StudentInfoModalProps {
  /** The student whose additional info is displayed */
  student: Student;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Modal to display a student's additional information
 */
export function StudentInfoModal({ student, onClose }: Readonly<StudentInfoModalProps>) {
  const { t } = useI18n();

  return (
    <dialog className="modal-overlay" open={true} aria-label={t('dashboard.students.additionalInfo')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="modal-title">{t('dashboard.students.additionalInfo')}</h3>
            <button
              onClick={onClose}
              className="modal-button cancel"
              style={{ padding: '0.5rem', minWidth: 'auto' }}
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', margin: 0 }}>
              {student.additionalInfo}
            </p>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#7a8078' }}>
            <strong>{student.name} {student.surnames}</strong>
          </div>
        </div>
      </div>
    </dialog>
  );
}

