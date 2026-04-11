import React from 'react';
import { Loader2, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import type { Student } from '../../domain/models';

interface QuickAssignModalProps {
  /** The student to be assigned */
  student: Student;
  /** Whether the assign operation is in progress */
  isAssigning: boolean;
  /** Callback to confirm the assignment */
  onConfirm: () => void;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Modal to confirm quick-assigning a student to the currently selected class
 */
export function QuickAssignModal({ student, isAssigning, onConfirm, onClose }: Readonly<QuickAssignModalProps>) {
  const { t } = useI18n();

  return (
    <dialog className="modal-overlay" open={true} aria-label={t('dashboard.students.confirmAssignTitle')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="modal-title">{t('dashboard.students.confirmAssignTitle')}</h3>
            <button
              onClick={onClose}
              className="modal-button cancel"
              style={{ padding: '0.5rem', minWidth: 'auto' }}
              aria-label={t('common.close')}
              disabled={isAssigning}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', marginBottom: '1rem' }}>
              {t('dashboard.students.confirmAssignMessage')}
            </p>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontWeight: 600, color: '#1e40af', margin: 0 }}>
                {student.name} {student.surnames}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#3b82f6', margin: '0.25rem 0 0 0' }}>
                {t('dashboard.students.dateOfBirth')}: {student.dateOfBirth}
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={onClose}
              className="modal-button cancel"
              disabled={isAssigning}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="modal-button save"
              disabled={isAssigning}
            >
              {isAssigning && <Loader2 className="animate-spin" size={16} />}
              {t('dashboard.students.confirmAssign')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

