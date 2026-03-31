import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { ExerciseService, ExerciseRequest, Exercise } from '../../services/ExerciseService';

/**
 * Props for ExerciseFormModal
 */
interface ExerciseFormModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Callback on successful creation/update */
  readonly onSuccess: () => void;
  /** SubjectClass ID to create the exercise for */
  readonly subjectClassId: number;
  /** Preset quarter (active quarter tab) */
  readonly quarterPreset: number;
  /** Existing exercise for edit mode (null = create mode) */
  readonly exercise?: Exercise | null;
  /** Sum of percentageGrade already used by other exercises (excluding the one being edited) */
  readonly usedPercentage?: number;
}

interface FormErrors {
  title?: string;
  quarter?: string;
  percentageGrade?: string;
  maxGrade?: string;
}

/**
 * Modal to create or edit an exercise
 */
export function ExerciseFormModal({
  isOpen,
  onClose,
  onSuccess,
  subjectClassId,
  quarterPreset,
  exercise,
  usedPercentage = 0,
}: ExerciseFormModalProps) {
  const { t } = useI18n();
  const isEditing = Boolean(exercise);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quarter, setQuarter] = useState(quarterPreset);
  const [percentageGrade, setPercentageGrade] = useState('');
  const [maxGrade, setMaxGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const quarterRef = useRef<HTMLButtonElement>(null);
  const quarterDropdownRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLInputElement>(null);
  const maxGradeRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && exercise) {
      setTitle(exercise.title);
      setDescription(exercise.description || '');
      setQuarter(quarterPreset);
      setPercentageGrade(String(exercise.percentageGrade));
      setMaxGrade(String(exercise.maxGrade));
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setQuarter(quarterPreset);
      setPercentageGrade('');
      setMaxGrade('');
    }
    setFormErrors({});
    setErrorMessage('');
    setQuarterDropdownOpen(false);
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen, exercise]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quarterDropdownRef.current && !quarterDropdownRef.current.contains(e.target as Node)) {
        setQuarterDropdownOpen(false);
      }
    };
    if (quarterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [quarterDropdownOpen]);

  const handleClose = () => {
    setFormErrors({});
    setErrorMessage('');
    onClose();
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!title.trim()) {
      errors.title = t('dashboard.rubrics.validation.titleRequired');
    } else if (title.trim().length > 60) {
      errors.title = t('dashboard.rubrics.validation.titleMaxLength');
    }

    if (!quarter) {
      errors.quarter = t('dashboard.rubrics.validation.quarterRequired');
    }

    const pctNum = Number(percentageGrade);
    const availablePercentage = 100 - usedPercentage;
    if (!percentageGrade.trim()) {
      errors.percentageGrade = t('dashboard.rubrics.validation.percentageRequired');
    } else if (pctNum < 1 || pctNum > 100) {
      errors.percentageGrade = t('dashboard.rubrics.validation.percentageRange');
    } else if (pctNum > availablePercentage) {
      errors.percentageGrade = t('dashboard.rubrics.validation.percentageExceeds')
        .replace('{available}', String(availablePercentage));
    }

    const maxNum = Number(maxGrade);
    if (!maxGrade.trim()) {
      errors.maxGrade = t('dashboard.rubrics.validation.maxGradeRequired');
    } else if (maxNum < 1 || maxNum > 20) {
      errors.maxGrade = t('dashboard.rubrics.validation.maxGradeRange');
    }

    setFormErrors(errors);

    // Focus first error field
    if (errors.title) {
      titleRef.current?.focus();
    } else if (errors.quarter) {
      quarterRef.current?.focus();
    } else if (errors.percentageGrade) {
      percentageRef.current?.focus();
    } else if (errors.maxGrade) {
      maxGradeRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      const data: ExerciseRequest = {
        title: title.trim(),
        description: description.trim(),
        quarter,
        percentageGrade: Number(percentageGrade),
        maxGrade: Number(maxGrade),
      };
      if (isEditing && exercise) {
        await ExerciseService.updateExercise(exercise.id, data);
      } else {
        await ExerciseService.createExercise(subjectClassId, data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      const fallbackKey = isEditing
        ? t('dashboard.rubrics.updateExerciseError')
        : t('dashboard.rubrics.createExerciseError');
      setErrorMessage(
        error instanceof Error ? error.message : fallbackKey
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNumericInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(value.replaceAll(/\D/g, ''));
  };

  if (!isOpen) return null;

  const modalTitle = isEditing
    ? t('dashboard.rubrics.editExercise')
    : t('dashboard.rubrics.createExercise');

  return (
    <dialog className="modal-overlay" open={isOpen} aria-label={modalTitle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="modal-content">
          <h3 className="modal-title">{modalTitle}</h3>

          {errorMessage && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
              {errorMessage}
            </div>
          )}

          <div className="modal-body">
            {/* Title */}
            <div>
              <label className="filter-label">
                {t('dashboard.rubrics.exerciseTitle')} <span className="form-required-asterisk">*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                className={`modal-input ${formErrors.title ? 'input-error' : ''}`}
                placeholder={t('dashboard.rubrics.exerciseTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                disabled={submitting}
              />
              {formErrors.title && <p className="form-error-text">{formErrors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="filter-label">{t('dashboard.rubrics.description')}</label>
              <textarea
                className="modal-input"
                placeholder={t('dashboard.rubrics.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Quarter */}
            <div>
              <label className="filter-label">
                {t('dashboard.rubrics.quarter')} <span className="form-required-asterisk">*</span>
              </label>
              <div className="shape-dropdown" ref={quarterDropdownRef}>
                <button
                  ref={quarterRef}
                  type="button"
                  className={`shape-dropdown-trigger modal-input ${formErrors.quarter ? 'input-error' : ''}`}
                  onClick={() => setQuarterDropdownOpen(prev => !prev)}
                  disabled={submitting}
                  aria-haspopup="listbox"
                  aria-expanded={quarterDropdownOpen}
                >
                  <span className="shape-dropdown-selected">
                    <span>{t(`dashboard.rubrics.quarter${quarter}`)}</span>
                  </span>
                  <ChevronDown size={16} className={`shape-dropdown-chevron ${quarterDropdownOpen ? 'open' : ''}`} />
                </button>

                {quarterDropdownOpen && (
                  <div className="selector-dropdown" style={{ minWidth: '100%', top: 'calc(100% + 4px)' }}>
                    {[1, 2, 3].map(q => (
                      <button
                        key={q}
                        type="button"
                        className="selector-option"
                        onClick={() => { setQuarter(q); setQuarterDropdownOpen(false); }}
                      >
                        {t(`dashboard.rubrics.quarter${q}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formErrors.quarter && <p className="form-error-text">{formErrors.quarter}</p>}
            </div>

            {/* Percentage Grade */}
            <div>
              <label className="filter-label">
                {t('dashboard.rubrics.percentageGrade')} (1-{100 - usedPercentage}) <span className="form-required-asterisk">*</span>
              </label>
              <input
                ref={percentageRef}
                type="text"
                inputMode="numeric"
                className={`modal-input ${formErrors.percentageGrade ? 'input-error' : ''}`}
                placeholder={`1 - ${100 - usedPercentage}`}
                value={percentageGrade}
                onChange={(e) => handleNumericInput(e.target.value, setPercentageGrade)}
                maxLength={3}
                disabled={submitting}
              />
              {formErrors.percentageGrade && <p className="form-error-text">{formErrors.percentageGrade}</p>}
            </div>

            {/* Max Grade */}
            <div>
              <label className="filter-label">
                {t('dashboard.rubrics.maxGrade')} (1-20) <span className="form-required-asterisk">*</span>
              </label>
              <input
                ref={maxGradeRef}
                type="text"
                inputMode="numeric"
                className={`modal-input ${formErrors.maxGrade ? 'input-error' : ''}`}
                placeholder="1 - 20"
                value={maxGrade}
                onChange={(e) => handleNumericInput(e.target.value, setMaxGrade)}
                maxLength={2}
                disabled={submitting}
              />
              {formErrors.maxGrade && <p className="form-error-text">{formErrors.maxGrade}</p>}
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button className="modal-button cancel" onClick={handleClose} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button className="modal-button save" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
              {modalTitle}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

