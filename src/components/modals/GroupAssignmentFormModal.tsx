import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { GroupAssignmentService } from '../../infrastructure/api/GroupAssignmentService';
import type { GroupAssignment } from '../../domain/models';

/**
 * Props for GroupAssignmentFormModal
 */
interface GroupAssignmentFormModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Class ID for creating a new assignment */
  readonly classId: number;
  /** Quarter (1, 2 or 3) — used automatically when creating */
  readonly quarter: 1 | 2 | 3;
  /** If provided, we are editing; otherwise creating */
  readonly editingAssignment?: GroupAssignment | null;
  /** Callback after successful save (create or update) */
  readonly onSaved: () => void;
}

/**
 * Form errors shape
 */
interface FormErrors {
  title?: string;
}

/**
 * Modal form for creating or editing a group assignment.
 * The quarter is determined by the active tab (prop) — no dropdown needed.
 */
export function GroupAssignmentFormModal({
  isOpen,
  onClose,
  classId,
  quarter,
  editingAssignment,
  onSaved,
}: GroupAssignmentFormModalProps) {
  const { t } = useI18n();
  /** Shorthand to access groupAssignments i18n keys */
  const gat = (key: string) => t(`dashboard.cooperative.groupAssignments.${key}`);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const titleRef = useRef<HTMLInputElement>(null);

  /** Populate form when editing */
  useEffect(() => {
    if (isOpen) {
      if (editingAssignment) {
        setTitle(editingAssignment.title);
        setDescription(editingAssignment.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
      setFormErrors({});
    }
  }, [isOpen, editingAssignment]);

  /** Validate and return true if valid */
  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!title.trim()) {
      errors.title = gat('validation.titleRequired');
    }
    setFormErrors(errors);

    if (errors.title) {
      titleRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  /** Handle save */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        quarter: editingAssignment ? editingAssignment.quarter : quarter,
      };
      if (editingAssignment) {
        await GroupAssignmentService.update(editingAssignment.id, data);
      } else {
        await GroupAssignmentService.create(classId, data);
      }
      onSaved();
      onClose();
    } catch (error) {
      const errKey = editingAssignment ? gat('updateError') : gat('createError');
      setFormErrors({ title: error instanceof Error ? error.message : errKey });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal-overlay" open={isOpen} aria-label={editingAssignment ? gat('editAssignment') : gat('addAssignment')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: '28rem', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="modal-title" style={{ marginBottom: 0 }}>
              {editingAssignment ? gat('editAssignment') : gat('addAssignment')}
            </h3>
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
            {/* Title */}
            <div>
              <label className="filter-label">{gat('assignmentTitle')} <span className="form-required-asterisk">*</span></label>
              <input
                ref={titleRef}
                type="text"
                className={`modal-input ${formErrors.title ? 'input-error' : ''}`}
                placeholder={gat('assignmentTitlePlaceholder')}
                value={title}
                onChange={(e) => { setTitle(e.target.value); setFormErrors(prev => ({ ...prev, title: undefined })); }}
                disabled={saving}
              />
              {formErrors.title && <p className="form-error-text">{formErrors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="filter-label">{gat('assignmentDescription')}</label>
              <textarea
                className="modal-input"
                placeholder={gat('assignmentDescriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button className="modal-button cancel" onClick={onClose} disabled={saving}>
              {t('common.cancel')}
            </button>
            <button className="modal-button save" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
