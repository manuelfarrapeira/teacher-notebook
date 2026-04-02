import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { ExerciseService } from '../../infrastructure/api/ExerciseService';

/**
 * Existing grade data for edit mode
 */
interface ExistingGrade {
  gradeId: number;
  grade: number;
  description: string;
}

/**
 * Props for GradeFormModal
 */
interface GradeFormModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Callback on successful create/update */
  readonly onSuccess: () => void;
  /** Exercise ID (for creating a new grade) */
  readonly exerciseId: number;
  /** Max grade for this exercise */
  readonly maxGrade: number;
  /** Student display name */
  readonly studentName: string;
  /** Student ID (for creating) */
  readonly studentId: number;
  /** Existing grade (if editing) */
  readonly existingGrade?: ExistingGrade | null;
}

interface FormErrors {
  grade?: string;
}

/**
 * Modal to create or edit a grade
 */
export function GradeFormModal({
  isOpen,
  onClose,
  onSuccess,
  exerciseId,
  maxGrade,
  studentName,
  studentId,
  existingGrade,
}: GradeFormModalProps) {
  const { t } = useI18n();
  const isEditing = Boolean(existingGrade);

  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const gradeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && existingGrade) {
      setGrade(String(existingGrade.grade));
      setDescription(existingGrade.description || '');
    } else if (isOpen) {
      setGrade('');
      setDescription('');
    }
    setFormErrors({});
    setErrorMessage('');
    if (isOpen) {
      setTimeout(() => gradeRef.current?.focus(), 50);
    }
  }, [isOpen, existingGrade]);

  const handleClose = () => {
    setGrade('');
    setDescription('');
    setFormErrors({});
    setErrorMessage('');
    onClose();
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};

    const num = Number(grade);
    if (grade.trim() === '') {
      errors.grade = t('dashboard.evalCriteria.validation.gradeRequired');
    } else if (Number.isNaN(num) || num < 0 || num > maxGrade) {
      errors.grade = t('dashboard.evalCriteria.validation.gradeRange').replace('{max}', String(maxGrade));
    }

    setFormErrors(errors);
    if (errors.grade) {
      gradeRef.current?.focus();
    }
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      if (isEditing && existingGrade) {
        await ExerciseService.updateGrade(existingGrade.gradeId, {
          grade: Number(grade),
          description: description.trim(),
        });
      } else {
        await ExerciseService.createGrade(exerciseId, {
          studentId,
          grade: Number(grade),
          description: description.trim(),
        });
      }
      onSuccess();
      handleClose();
    } catch (error) {
      const fallback = isEditing
        ? t('dashboard.evalCriteria.updateGradeError')
        : t('dashboard.evalCriteria.createGradeError');
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeInput = (value: string) => {
    // Allow digits and one decimal point
    const cleaned = value.replaceAll(/[^\d.]/g, '');
    // Prevent more than one decimal point
    const parts = cleaned.split('.');
    let result = cleaned;
    if (parts.length > 2) {
      result = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    // Limit to 2 decimal places
    const finalParts = result.split('.');
    if (finalParts.length === 2 && finalParts[1].length > 2) {
      result = `${finalParts[0]}.${finalParts[1].slice(0, 2)}`;
    }
    setGrade(result);
  };

  if (!isOpen) return null;

  const modalTitle = isEditing
    ? t('dashboard.evalCriteria.editGrade')
    : t('dashboard.evalCriteria.createGrade');

  return (
    <dialog className="modal-overlay" open={isOpen} aria-label={modalTitle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <h3 className="modal-title">{modalTitle}</h3>

          <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.875rem', color: '#1e40af' }}>
            <strong>{studentName}</strong>
          </div>

          {errorMessage && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
              {errorMessage}
            </div>
          )}

          <div className="modal-body">
            {/* Grade */}
            <div>
              <label className="filter-label">
                {t('dashboard.evalCriteria.grade')} (0 - {maxGrade}) <span className="form-required-asterisk">*</span>
              </label>
              <input
                ref={gradeRef}
                type="text"
                inputMode="decimal"
                className={`modal-input ${formErrors.grade ? 'input-error' : ''}`}
                placeholder={`0 - ${maxGrade}`}
                value={grade}
                onChange={(e) => handleGradeInput(e.target.value)}
                disabled={submitting}
              />
              {formErrors.grade && <p className="form-error-text">{formErrors.grade}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="filter-label">{t('dashboard.evalCriteria.description')}</label>
              <textarea
                className="modal-input"
                placeholder={t('dashboard.evalCriteria.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button className="modal-button cancel" onClick={handleClose} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button className="modal-button save" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

