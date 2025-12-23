import React, { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  title: string;
  confirmMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * Modal component for confirming delete actions
 * @param {ConfirmDeleteModalProps} props - Component props
 */
export function ConfirmDeleteModal({
  isOpen,
  itemName,
  title,
  confirmMessage,
  onConfirm,
  onCancel,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={title}
      onClose={onCancel}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="modal-content" ref={modalRef}>
          <h3 className="modal-title" style={{ color: '#dc2626' }}>
            {title}
          </h3>
          <div className="modal-body">
            <p>{confirmMessage.replace('{name}', itemName)}</p>
          </div>
          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button
              className="modal-button cancel"
              onClick={onCancel}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </button>
            <button
              className="modal-button save"
              style={{ backgroundColor: '#dc2626' }}
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />
              )}
              {t('dashboard.schools.deleteConfirmBtn')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

