import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { CalendarAlertService, CalendarAlert, CalendarAlertRequestDTO } from '../../services/CalendarAlertService';
import { ApiErrorException } from '../../services/BaseService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ErrorModal } from './ErrorModal';
import { SuccessModal } from './SuccessModal';

interface CalendarAlertFormModalProps {
  isOpen: boolean;
  alertToEdit: CalendarAlert | null;
  selectedDate: Date | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

interface FormData {
  date: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface FormErrors {
  date?: string;
  title?: string;
  endTime?: string;
}

function dateToInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function inputValueToApiFormat(value: string): string {
  const [y, m, d] = value.split('-');
  return `${d}/${m}/${y}`;
}

function alertDateToInputValue(dateStr: string): string {
  const [d, m, y] = dateStr.split('/');
  return `${y}-${m}-${d}`;
}

function getErrorMessage(error: unknown, fallbackEdit: string, fallbackCreate: string, isEdit: boolean): string {
  if (error instanceof ApiErrorException) {
    return error.apiError.detail ?? error.apiError.description;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return isEdit ? fallbackEdit : fallbackCreate;
}

function getDeleteErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiErrorException) {
    return error.apiError.detail ?? error.apiError.description;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function CalendarAlertFormModal({
  isOpen,
  alertToEdit,
  selectedDate,
  onClose,
  onSaved,
  onDeleted,
}: Readonly<CalendarAlertFormModalProps>) {
  const { t } = useI18n();
  const isEditMode = alertToEdit !== null;

  const [formData, setFormData] = useState<FormData>({
    date: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingClose, setPendingClose] = useState<'saved' | 'deleted' | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && alertToEdit) {
      setFormData({
        date: alertDateToInputValue(alertToEdit.date),
        title: alertToEdit.title,
        description: alertToEdit.description ?? '',
        startTime: alertToEdit.startTime ?? '',
        endTime: alertToEdit.endTime ?? '',
      });
    } else {
      setFormData({
        date: selectedDate ? dateToInputValue(selectedDate) : '',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
      });
    }
    setFormErrors({});
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [isOpen, alertToEdit, isEditMode, selectedDate]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.date) {
      errors.date = t('dashboard.calendar.validation.dateRequired');
    }

    if (!formData.title.trim()) {
      errors.title = t('dashboard.calendar.validation.titleRequired');
    } else if (formData.title.trim().length > 100) {
      errors.title = t('dashboard.calendar.validation.titleMaxLength');
    }

    if (formData.endTime && !formData.startTime) {
      errors.endTime = t('dashboard.calendar.validation.endTimeRequiresStart');
    } else if (formData.endTime && formData.startTime && formData.endTime <= formData.startTime) {
      errors.endTime = t('dashboard.calendar.validation.endTimeAfterStart');
    }

    setFormErrors(errors);

    if (errors.date) {
      dateRef.current?.focus();
    } else if (errors.title) {
      titleRef.current?.focus();
    } else if (errors.endTime) {
      endTimeRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const dateStr = isEditMode && alertToEdit
      ? alertToEdit.date
      : inputValueToApiFormat(formData.date);

    const dto: CalendarAlertRequestDTO = {
      date: dateStr,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
    };

    setSubmitting(true);
    try {
      if (isEditMode && alertToEdit) {
        await CalendarAlertService.update(alertToEdit.id, dto);
        setSuccessMessage(t('dashboard.calendar.updateSuccess'));
      } else {
        await CalendarAlertService.create(dto);
        setSuccessMessage(t('dashboard.calendar.createSuccess'));
      }
      setPendingClose('saved');
      setSuccessModalOpen(true);
    } catch (error) {
      const msg = getErrorMessage(
        error,
        t('dashboard.calendar.updateError'),
        t('dashboard.calendar.createError'),
        isEditMode
      );
      setErrorMessage(msg);
      setErrorModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!alertToEdit) return;
    setDeleting(true);
    try {
      await CalendarAlertService.deleteAlert(alertToEdit.id);
      setConfirmDeleteOpen(false);
      setSuccessMessage(t('dashboard.calendar.deleteSuccess'));
      setPendingClose('deleted');
      setSuccessModalOpen(true);
    } catch (error) {
      setConfirmDeleteOpen(false);
      setErrorMessage(getDeleteErrorMessage(error, t('dashboard.calendar.deleteError')));
      setErrorModalOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    if (pendingClose === 'saved') {
      setPendingClose(null);
      onSaved();
      onClose();
    } else if (pendingClose === 'deleted') {
      setPendingClose(null);
      onDeleted();
      onClose();
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  const modalTitle = isEditMode
    ? t('dashboard.calendar.editAlert')
    : t('dashboard.calendar.newAlert');

  return (
    <>
      <dialog
        className="modal-overlay"
        open={isOpen}
        aria-label={modalTitle}
        onClose={onClose}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="modal-content">
            <h3 className="modal-title">{modalTitle}</h3>

            <div className="modal-body">
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  {t('dashboard.calendar.alertDate')} <span className="form-required-asterisk">*</span>
                </label>
                <input
                  ref={dateRef}
                  className={`modal-input${formErrors.date ? ' input-error' : ''}`}
                  type="date"
                  value={formData.date}
                  onChange={e => handleFieldChange('date', e.target.value)}
                  readOnly={isEditMode}
                  style={isEditMode ? { backgroundColor: '#f3f4f6', cursor: 'default' } : undefined}
                  disabled={submitting}
                />
                {formErrors.date && (
                  <p className="form-error-text">{formErrors.date}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  {t('dashboard.calendar.alertTitle')} <span className="form-required-asterisk">*</span>
                </label>
                <input
                  ref={titleRef}
                  className={`modal-input${formErrors.title ? ' input-error' : ''}`}
                  type="text"
                  value={formData.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  placeholder={t('dashboard.calendar.alertTitlePlaceholder')}
                  maxLength={100}
                  disabled={submitting}
                />
                {formErrors.title && (
                  <p className="form-error-text">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  {t('dashboard.calendar.alertDescription')}
                </label>
                <textarea
                  className="modal-input"
                  value={formData.description}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  placeholder={t('dashboard.calendar.alertDescriptionPlaceholder')}
                  rows={3}
                  disabled={submitting}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                    {t('dashboard.calendar.alertStartTime')}
                  </label>
                  <input
                    className="modal-input"
                    type="time"
                    value={formData.startTime}
                    onChange={e => handleFieldChange('startTime', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                    {t('dashboard.calendar.alertEndTime')}
                  </label>
                  <input
                    ref={endTimeRef}
                    className={`modal-input${formErrors.endTime ? ' input-error' : ''}`}
                    type="time"
                    value={formData.endTime}
                    onChange={e => handleFieldChange('endTime', e.target.value)}
                    disabled={submitting}
                  />
                  {formErrors.endTime && (
                    <p className="form-error-text">{formErrors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem', justifyContent: isEditMode ? 'space-between' : 'flex-end' }}>
              {isEditMode && (
                <button
                  className="modal-button"
                  style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={submitting || deleting}
                >
                  {t('common.delete')}
                </button>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="modal-button cancel"
                  onClick={onClose}
                  disabled={submitting || deleting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="modal-button save"
                  onClick={handleSubmit}
                  disabled={submitting || deleting}
                >
                  {submitting && (
                    <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />
                  )}
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        title={t('dashboard.calendar.deleteTitle')}
        itemName={alertToEdit?.title ?? ''}
        confirmMessage={t('dashboard.calendar.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        isDeleting={deleting}
      />

      <ErrorModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />

      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </>
  );
}

