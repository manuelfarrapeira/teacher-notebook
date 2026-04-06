import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, Loader2, Plus, Edit, Trash2, X, Printer, BookType } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { ScheduleService, ScheduleItem, ScheduleItemRequest } from '../../infrastructure/api/ScheduleService';
import { SubjectService, Subject } from '../../infrastructure/api/SubjectService';
import { ApiErrorException } from '../../infrastructure/api/BaseService';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { ClassSubjectsModal } from '../modals/ClassSubjectsModal';

interface TimetableTabProps {
  selectedClass: number | null;
}

/** Single schedule item for the form */
interface ScheduleFormItem {
  id: string;
  subjectId: number;
  start: string;
  end: string;
}

/** Form data for creating/editing schedules */
interface FormData {
  day: number;
  items: ScheduleFormItem[];
}

/** Errors for a single item */
interface ItemErrors {
  subjectId?: string;
  start?: string;
  end?: string;
  overlap?: string;
}

/** Form errors structure */
interface FormErrors {
  day?: string;
  items?: Record<string, ItemErrors>;
}

/** Generate unique ID for form items */
const generateId = (): string => Math.random().toString(36).substring(2, 9);

/** Create empty schedule item */
const createEmptyItem = (): ScheduleFormItem => ({
  id: generateId(),
  subjectId: 0,
  start: '',
  end: '',
});

const INITIAL_FORM_DATA: FormData = {
  day: 0,
  items: [createEmptyItem()],
};

/**
 * TimetableTab component for managing class schedules
 * Displays a weekly timetable table with CRUD operations
 */
export function TimetableTab({ selectedClass }: Readonly<TimetableTabProps>) {
  const { t } = useI18n();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);

  const daySelectRef = useRef<HTMLButtonElement>(null);
  const subjectSelectRef = useRef<HTMLButtonElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const dayNames = useMemo(() => [
    { id: 1, name: t('dashboard.schedule.monday') },
    { id: 2, name: t('dashboard.schedule.tuesday') },
    { id: 3, name: t('dashboard.schedule.wednesday') },
    { id: 4, name: t('dashboard.schedule.thursday') },
    { id: 5, name: t('dashboard.schedule.friday') },
  ], [t]);

  const getDayName = (dayId: number): string => {
    const day = dayNames.find(d => d.id === dayId);
    return day ? day.name : '';
  };


  const getSubjectName = (subjectId: number): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : '';
  };

  /**
   * Extracts detailed error message from API error response
   * @param error - The error caught from API call
   * @param fallbackMessage - Fallback message if no details available
   * @returns Formatted error message string
   */
  const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
    if (error instanceof ApiErrorException) {
      const apiError = error.apiError;

      if (apiError.details && apiError.details.length > 0) {
        return apiError.details.map(d => d.reason).join('\n');
      }

      if (apiError.detail) {
        return apiError.detail;
      }

      if (apiError.description) {
        return apiError.description;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallbackMessage;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const timeSlots = useMemo(() => {
    if (schedules.length === 0) return [];

    const timePoints = new Set<string>();
    schedules.forEach(schedule => {
      timePoints.add(schedule.start);
      timePoints.add(schedule.end);
    });

    const sortedTimes = Array.from(timePoints).sort((a, b) => a.localeCompare(b));

    const slots: { start: string; end: string }[] = [];
    for (let i = 0; i < sortedTimes.length - 1; i++) {
      slots.push({
        start: sortedTimes[i],
        end: sortedTimes[i + 1],
      });
    }

    return slots;
  }, [schedules]);

  const getRowSpan = (schedule: ScheduleItem): number => {
    let span = 0;
    for (const slot of timeSlots) {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      const scheduleStart = timeToMinutes(schedule.start);
      const scheduleEnd = timeToMinutes(schedule.end);

      if (slotStart >= scheduleStart && slotEnd <= scheduleEnd) {
        span++;
      }
    }
    return Math.max(span, 1);
  };

  const isSlotCoveredByEarlierSchedule = (dayId: number, slotStart: string): boolean => {
    return schedules.some(s => {
      if (s.day !== dayId) return false;
      const scheduleStart = timeToMinutes(s.start);
      const slotStartMin = timeToMinutes(slotStart);
      return scheduleStart < slotStartMin && timeToMinutes(s.end) > slotStartMin;
    });
  };

  const subjectColors = [
    { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '#3b82f6', text: '#1e40af' },
    { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '#22c55e', text: '#166534' },
    { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '#f59e0b', text: '#92400e' },
    { bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', border: '#ec4899', text: '#9d174d' },
    { bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', border: '#6366f1', text: '#4338ca' },
    { bg: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', border: '#14b8a6', text: '#115e59' },
    { bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', border: '#ef4444', text: '#991b1b' },
    { bg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', border: '#a855f7', text: '#7e22ce' },
    { bg: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', border: '#f97316', text: '#9a3412' },
    { bg: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)', border: '#06b6d4', text: '#155e75' },
    { bg: 'linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)', border: '#84cc16', text: '#3f6212' },
    { bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '#10b981', text: '#064e3b' },
    { bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '#0ea5e9', text: '#075985' },
    { bg: 'linear-gradient(135deg, #e8f0ec 0%, #d0ddd3 100%)', border: '#3d7a5e', text: '#1e4a38' },
    { bg: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)', border: '#d946ef', text: '#86198f' },
    { bg: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)', border: '#f43f5e', text: '#9f1239' },
    { bg: 'linear-gradient(135deg, #f5f0e8 0%, #e0d8cf 100%)', border: '#7a8078', text: '#334155' },
    { bg: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)', border: '#78716c', text: '#44403c' },
  ];

  const getSubjectColor = (subjectId: number) => {
    const colorIndex = subjectId % subjectColors.length;
    return subjectColors[colorIndex];
  };


  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
      fetchSchedules();
    } else {
      setSchedules([]);
      setSubjects([]);
    }
  }, [selectedClass]);

  const fetchSubjects = async () => {
    if (!selectedClass) return;

    try {
      const data = await SubjectService.getSubjectsByClass(selectedClass);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const data = await ScheduleService.getSchedules(selectedClass);
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setErrorMessage(getErrorMessage(error, t('dashboard.schedule.loadError')));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.day || formData.day === 0) {
      errors.day = t('dashboard.schedule.validation.dayRequired');
    }

    const itemsErrors: Record<string, ItemErrors> = {};
    formData.items.forEach(item => {
      const itemErrors: ItemErrors = {};

      if (!item.subjectId || item.subjectId === 0) {
        itemErrors.subjectId = t('dashboard.schedule.validation.subjectRequired');
      }

      if (!item.start) {
        itemErrors.start = t('dashboard.schedule.validation.startRequired');
      }

      if (!item.end) {
        itemErrors.end = t('dashboard.schedule.validation.endRequired');
      }

      if (item.start && item.end && item.start >= item.end) {
        itemErrors.end = t('dashboard.schedule.validation.endAfterStart');
      }

      const overlappingItem = formData.items.find(i => i !== item && i.start < item.end && i.end > item.start);
      if (overlappingItem) {
        itemErrors.overlap = t('dashboard.schedule.validation.noOverlap');
      }

      if (Object.keys(itemErrors).length > 0) {
        itemsErrors[item.id] = itemErrors;
      }
    });

    errors.items = itemsErrors;
    setFormErrors(errors);

    if (errors.day) {
      daySelectRef.current?.focus();
    } else if (errors.items) {
      const firstErrorItem = Object.keys(errors.items).find(itemId => {
        const itemError = errors.items?.[itemId];
        return itemError?.subjectId || itemError?.start || itemError?.end || itemError?.overlap;
      });
      if (firstErrorItem && errors.items[firstErrorItem]) {
        const itemErrors = errors.items[firstErrorItem];
        if (itemErrors.subjectId) {
          subjectSelectRef.current?.focus();
        } else if (itemErrors.start) {
          startInputRef.current?.focus();
        } else if (itemErrors.end) {
          endInputRef.current?.focus();
        }
      }
    }

    return !errors.day && Object.keys(itemsErrors).length === 0;
  };

  /** Handle day change */
  const handleDayChange = (value: number) => {
    setFormData(prev => ({ ...prev, day: value }));
    if (formErrors.day) {
      setFormErrors(prev => ({ ...prev, day: undefined }));
    }
  };

  /** Handle item field change */
  const handleItemChange = (itemId: string, field: keyof ScheduleFormItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
    if (formErrors.items?.[itemId]?.[field as keyof ItemErrors]) {
      setFormErrors(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [itemId]: {
            ...prev.items?.[itemId],
            [field]: undefined,
          },
        },
      }));
    }
  };

  /** Add new empty item to the form */
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  };

  /** Remove item from the form */
  const handleRemoveItem = (itemId: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const handleAddClick = () => {
    setEditingSchedule(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setShowForm(true);
  };

  const handleAddSlotClick = (dayId: number, startTime: string, endTime: string) => {
    setEditingSchedule(null);
    setFormData({
      day: dayId,
      items: [
        {
          id: generateId(),
          subjectId: 0,
          start: startTime,
          end: endTime,
        },
      ],
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEditClick = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      day: schedule.day,
      items: [
        {
          id: generateId(),
          subjectId: schedule.subjectId,
          start: schedule.start,
          end: schedule.end,
        },
      ],
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteClick = (schedule: ScheduleItem) => {
    setScheduleToDelete(schedule);
    setConfirmDeleteOpen(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedClass) return;

    setSubmitting(true);
    try {
      if (editingSchedule) {
        await ScheduleService.updateSchedule(editingSchedule.id, {
          day: formData.day,
          start: formData.items[0].start,
          end: formData.items[0].end,
        });
        setSuccessMessage(t('dashboard.schedule.updateSuccess'));
      } else {
        const itemsToCreate: ScheduleItemRequest[] = formData.items.map(item => ({
          subjectId: item.subjectId,
          start: item.start,
          end: item.end,
        }));
        await ScheduleService.createSchedule(selectedClass, formData.day, itemsToCreate);
        setSuccessMessage(t('dashboard.schedule.createSuccess'));
      }
      setSuccessDialogOpen(true);
      setShowForm(false);
      setEditingSchedule(null);
      setFormData(INITIAL_FORM_DATA);
      await fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      const fallbackMsg = editingSchedule
        ? t('dashboard.schedule.updateError')
        : t('dashboard.schedule.createError');
      setErrorMessage(getErrorMessage(error, fallbackMsg));
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;

    setDeleting(true);
    try {
      await ScheduleService.deleteSchedules([scheduleToDelete.id]);
      setSuccessMessage(t('dashboard.schedule.deleteSuccess'));
      setSuccessDialogOpen(true);
      setConfirmDeleteOpen(false);
      setScheduleToDelete(null);
      await fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setErrorMessage(getErrorMessage(error, t('dashboard.schedule.deleteError')));
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedClass) {
    return (
      <div className="dashboard-card">
        <div className="schedule-no-class">
          <Clock className="schedule-no-class-icon" />
          <p className="schedule-no-class-text">{t('dashboard.schedule.noClassSelected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="dashboard-section-header">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="tooltip-container tooltip-bottom" data-tooltip={t('dashboard.classSubjects.manageSubjects')}>
            <button
              className="dashboard-add-btn"
              onClick={() => setShowSubjectsModal(true)}
            >
              <BookType size={16} />
            </button>
          </div>
          <div className="tooltip-container tooltip-bottom" data-tooltip={t('common.print')}>
            <button
              className="dashboard-add-btn"
              onClick={handlePrint}
            >
              <Printer size={16} />
            </button>
          </div>
          <button className="dashboard-add-btn" onClick={handleAddClick}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            {t('dashboard.schedule.addEntry')}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-center">
          <Loader2 className="icon-spin" size={32} />
        </div>
      )}

      {/* Empty state */}
      {!loading && schedules.length === 0 && (
        <div className="dashboard-empty">
          <Clock className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.schedule.noEntries')}</p>
        </div>
      )}

      {/* Schedule table */}
      {!loading && schedules.length > 0 && (
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="schedule-time-header">{t('dashboard.schedule.time')}</th>
                {dayNames.map(day => (
                  <th key={day.id} className="schedule-day-header">
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => {
                const slotDuration = timeToMinutes(slot.end) - timeToMinutes(slot.start);
                const rowHeight = Math.max(slotDuration * 2.0, 50);

                return (
                  <tr
                    key={`${slot.start}-${slot.end}`}
                    className="schedule-row"
                    style={{ height: `${rowHeight}px` }}
                  >
                    <td className="schedule-time-cell">
                      {slot.start} - {slot.end}
                    </td>
                  {dayNames.map(day => {
                    const scheduleStartingHere = schedules.find(
                      s => s.day === day.id && s.start === slot.start
                    );

                    if (scheduleStartingHere) {
                      const rowSpan = getRowSpan(scheduleStartingHere);
                      const colors = getSubjectColor(scheduleStartingHere.subjectId);

                      return (
                        <td
                          key={day.id}
                          className="schedule-cell schedule-cell-filled"
                          rowSpan={rowSpan}
                          style={{
                            background: colors.bg,
                          }}
                        >
                          <div className="schedule-cell-content">
                            <span className="schedule-cell-subject" style={{ color: colors.text }}>
                              {getSubjectName(scheduleStartingHere.subjectId)}
                            </span>
                            <span className="schedule-cell-time" style={{ color: colors.text, opacity: 0.8 }}>
                              {scheduleStartingHere.start} - {scheduleStartingHere.end}
                            </span>
                            <div className="schedule-cell-actions">
                              <div className="tooltip-container" data-tooltip={t('dashboard.schedule.editEntry')}>
                                <button
                                  className="schedule-action-btn edit"
                                  onClick={() => handleEditClick(scheduleStartingHere)}
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                              <div className="tooltip-container" data-tooltip={t('common.delete')}>
                                <button
                                  className="schedule-action-btn delete"
                                  onClick={() => handleDeleteClick(scheduleStartingHere)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    if (isSlotCoveredByEarlierSchedule(day.id, slot.start)) {
                      return null;
                    }

                    return (
                      <td
                        key={day.id}
                        className="schedule-cell schedule-cell-empty clickable-cell tooltip-container"
                        onClick={() => handleAddSlotClick(day.id, slot.start, slot.end)}
                        data-tooltip={t('dashboard.schedule.addEntry')}
                      >
                        {/* Empty */}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <dialog
          className="modal-overlay"
          open={showForm}
          aria-label={editingSchedule ? t('dashboard.schedule.editEntry') : t('dashboard.schedule.addEntry')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
            <div className="modal-content" style={{ maxWidth: '32rem', minWidth: '32rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <h3 className="modal-title">
                {editingSchedule ? t('dashboard.schedule.editEntry') : t('dashboard.schedule.addEntry')}
              </h3>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                {/* Day selector */}
                <div>
                  <label className="filter-label">
                    {t('dashboard.schedule.day')} <span className="form-required-asterisk">*</span>
                  </label>
                  <Select
                    value={formData.day ? String(formData.day) : ''}
                    onValueChange={(v) => handleDayChange(Number(v))}
                    disabled={submitting}
                  >
                    <SelectTrigger
                      ref={daySelectRef}
                      className={`schedule-form-select ${formErrors.day ? 'input-error' : ''}`}
                    >
                      <SelectValue placeholder={t('dashboard.schedule.selectDay')} />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map(day => (
                        <SelectItem key={day.id} value={String(day.id)}>
                          {day.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.day && <p className="form-error-text">{formErrors.day}</p>}
                </div>

                {/* Schedule items */}
                <div className="schedule-items-container">
                  {formData.items.map((item, index) => {
                    const itemErrors = formErrors.items?.[item.id];
                    const hasErrors = Boolean(itemErrors?.subjectId || itemErrors?.start || itemErrors?.end || itemErrors?.overlap);

                    return (
                      <div
                        key={item.id}
                        className={`schedule-item-card ${hasErrors ? 'schedule-item-error' : ''}`}
                      >
                        <div className="schedule-item-header">
                          <span className="schedule-item-number">
                            {t('dashboard.schedule.subject')} {index + 1}
                          </span>
                          {formData.items.length > 1 && !editingSchedule && (
                            <button
                              type="button"
                              className="schedule-item-remove-btn"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={submitting}
                              title={t('dashboard.schedule.removeItem')}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        <div className="schedule-item-fields">
                          {/* Subject selector */}
                          <div>
                            <label className="filter-label">
                              {t('dashboard.schedule.subject')} <span className="form-required-asterisk">*</span>
                            </label>
                            <Select
                              value={item.subjectId ? String(item.subjectId) : ''}
                              onValueChange={(v) => handleItemChange(item.id, 'subjectId', Number(v))}
                              disabled={submitting || (Boolean(editingSchedule) && index === 0)}
                            >
                              <SelectTrigger
                                ref={index === 0 ? subjectSelectRef : undefined}
                                className={`schedule-form-select ${itemErrors?.subjectId ? 'input-error' : ''}`}
                              >
                                <SelectValue placeholder={t('dashboard.schedule.selectSubject')} />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map(subject => (
                                  <SelectItem key={subject.id} value={String(subject.id)}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {itemErrors?.subjectId && (
                              <p className="form-error-text">{itemErrors.subjectId}</p>
                            )}
                          </div>

                          {/* Time inputs */}
                          <div className="schedule-item-time-row">
                            <div>
                              <label className="filter-label">
                                {t('dashboard.schedule.start')} <span className="form-required-asterisk">*</span>
                              </label>
                              <input
                                ref={index === 0 ? startInputRef : undefined}
                                type="time"
                                className={`modal-input ${itemErrors?.start ? 'input-error' : ''}`}
                                value={item.start}
                                onChange={(e) => handleItemChange(item.id, 'start', e.target.value)}
                                disabled={submitting}
                              />
                              {itemErrors?.start && (
                                <p className="form-error-text">{itemErrors.start}</p>
                              )}
                            </div>
                            <div>
                              <label className="filter-label">
                                {t('dashboard.schedule.end')} <span className="form-required-asterisk">*</span>
                              </label>
                              <input
                                ref={index === 0 ? endInputRef : undefined}
                                type="time"
                                className={`modal-input ${itemErrors?.end ? 'input-error' : ''}`}
                                value={item.end}
                                onChange={(e) => handleItemChange(item.id, 'end', e.target.value)}
                                disabled={submitting}
                              />
                              {itemErrors?.end && (
                                <p className="form-error-text">{itemErrors.end}</p>
                              )}
                            </div>
                          </div>

                          {/* Overlap error */}
                          {itemErrors?.overlap && (
                            <p className="form-error-text">{itemErrors.overlap}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add item button - only show when creating new */}
                  {!editingSchedule && (
                    <button
                      type="button"
                      className="schedule-add-item-btn"
                      onClick={handleAddItem}
                      disabled={submitting}
                    >
                      <Plus size={16} />
                      {t('dashboard.schedule.addItem')}
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button
                  className="modal-button cancel"
                  onClick={handleCancelForm}
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="modal-button save"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
                  {editingSchedule ? t('dashboard.subjects.update') : t('dashboard.subjects.create')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successDialogOpen}
        message={successMessage}
        onClose={() => setSuccessDialogOpen(false)}
      />

      {/* Confirm Delete Modal */}
      {scheduleToDelete && (
        <ConfirmDeleteModal
          isOpen={confirmDeleteOpen}
          itemName={`${getSubjectName(scheduleToDelete.subjectId)} (${getDayName(scheduleToDelete.day)} ${scheduleToDelete.start}-${scheduleToDelete.end})`}
          title={t('dashboard.schedule.deleteTitle')}
          confirmMessage={t('dashboard.schedule.deleteConfirm')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setConfirmDeleteOpen(false);
            setScheduleToDelete(null);
          }}
          isDeleting={deleting}
        />
      )}

      {/* Class Subjects Modal */}
      {selectedClass && (
        <ClassSubjectsModal
          isOpen={showSubjectsModal}
          classId={selectedClass}
          className=""
          onClose={() => setShowSubjectsModal(false)}
          onSubjectsChanged={fetchSubjects}
        />
      )}
    </div>
  );
}

