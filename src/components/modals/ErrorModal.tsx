import React, { useRef } from 'react';
import { useI18n } from '../../lib/i18n';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

/**
 * Modal component for displaying error messages
 * @param {ErrorModalProps} props - Component props
 */
export function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={t('common.error')}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="modal-content" ref={modalRef}>
          <h3 className="modal-title" style={{ color: '#dc2626' }}>
            ❌ {t('common.error')}
          </h3>
          <div className="modal-body">
            <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
          </div>
          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button
              className="modal-button save"
              onClick={onClose}
              style={{ backgroundColor: '#dc2626' }}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

