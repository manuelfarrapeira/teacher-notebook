import React, { useRef } from 'react';
import { useI18n } from '../../lib/i18n';

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

/**
 * Modal component for displaying success messages
 * @param {SuccessModalProps} props - Component props
 */
export function SuccessModal({ isOpen, message, onClose }: SuccessModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={t('common.success')}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
        <div className="modal-content" ref={modalRef} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <h3 className="modal-title" style={{ color: '#16a34a' }}>
            ✅ {t('common.success')}
          </h3>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button
              className="modal-button save"
              onClick={onClose}
              style={{ backgroundColor: '#16a34a' }}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

