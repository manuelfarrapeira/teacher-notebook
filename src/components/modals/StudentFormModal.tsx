import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { StudentService, Student, StudentRequestDTO, Gender, Shape } from '../../services/StudentService';
import { formatDateForApi, formatDateForInput } from '../../lib/utils';
import { useStudentPhotoCache } from '../../contexts/StudentPhotoContext';
import { StudentPhoto } from '../students/StudentPhoto';
import { ErrorModal } from './ErrorModal';
import { SuccessModal } from './SuccessModal';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
}

interface FormData {
  name: string;
  surnames: string;
  dateOfBirth: string;
  additionalInfo: string;
  gender: Gender | '';
  shape: Shape | '';
}

interface FormErrors {
  name?: string;
  surnames?: string;
  dateOfBirth?: string;
  gender?: string;
}

export function StudentFormModal({ isOpen, onClose, onSuccess, student }: Readonly<StudentFormModalProps>) {
  const { t } = useI18n();
  const { invalidatePhoto } = useStudentPhotoCache();
  const [submitting, setSubmitting] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(student?.photo || null);

  const [formData, setFormData] = useState<FormData>({
    name: student?.name || '',
    surnames: student?.surnames || '',
    dateOfBirth: student?.dateOfBirth ? formatDateForInput(student.dateOfBirth) : '',
    additionalInfo: student?.additionalInfo || '',
    gender: student?.gender || '',
    shape: student?.shape || '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false);
  const shapeDropdownRef = useRef<HTMLDivElement>(null);
  const shapeTriggerRef = useRef<HTMLButtonElement>(null);
  const [shapeMenuPos, setShapeMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const surnamesInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const genderInputRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (student) {
      setFormData({
        name: student.name,
        surnames: student.surnames,
        dateOfBirth: formatDateForInput(student.dateOfBirth),
        additionalInfo: student.additionalInfo,
        gender: student.gender || '',
        shape: student.shape || '',
      });
      setCurrentPhoto(student.photo);
    } else {
      setFormData({
        name: '',
        surnames: '',
        dateOfBirth: '',
        additionalInfo: '',
        gender: '',
        shape: '',
      });
      setCurrentPhoto(null);
    }
    setFormErrors({});
    setShapeDropdownOpen(false);
    setGenderDropdownOpen(false);
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen, student]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapeDropdownRef.current && !shapeDropdownRef.current.contains(e.target as Node)) {
        setShapeDropdownOpen(false);
      }
    };
    if (shapeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate fixed position from trigger button
      if (shapeTriggerRef.current) {
        const rect = shapeTriggerRef.current.getBoundingClientRect();
        setShapeMenuPos({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      }
    } else {
      setShapeMenuPos(null);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shapeDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target as Node)) {
        setGenderDropdownOpen(false);
      }
    };
    if (genderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [genderDropdownOpen]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = t('dashboard.students.validation.nameRequired');
    }

    if (!formData.surnames.trim()) {
      errors.surnames = t('dashboard.students.validation.surnamesRequired');
    }

    const trimmedDate = formData.dateOfBirth.trim();
    if (trimmedDate.length === 0) {
      errors.dateOfBirth = t('dashboard.students.validation.dateOfBirthRequired');
    } else {
      const selectedDate = new Date(trimmedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errors.dateOfBirth = t('dashboard.students.validation.dateOfBirthInvalid');
      }
    }

    if (!formData.gender) {
      errors.gender = t('dashboard.students.validation.genderRequired');
    }

    setFormErrors(errors);

    if (errors.name) {
      nameInputRef.current?.focus();
    } else if (errors.surnames) {
      surnamesInputRef.current?.focus();
    } else if (errors.dateOfBirth) {
      dateInputRef.current?.focus();
    } else if (errors.gender) {
      genderInputRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const studentData: StudentRequestDTO = {
        name: formData.name.trim(),
        surnames: formData.surnames.trim(),
        dateOfBirth: formatDateForApi(formData.dateOfBirth),
        additionalInfo: formData.additionalInfo.trim(),
        gender: formData.gender as Gender,
        shape: formData.shape || undefined,
      };

      if (student) {
        await StudentService.updateStudent(student.id, studentData);
        setSuccessMessage(t('dashboard.students.updateSuccess'));
      } else {
        await StudentService.createStudent(studentData);
        setSuccessMessage(t('dashboard.students.createSuccess'));
      }

      setSuccessDialogOpen(true);
    } catch (error) {
      const defaultErrorMsg = student ? t('dashboard.students.updateError') : t('dashboard.students.createError');
      setErrorMessage(error instanceof Error ? error.message : defaultErrorMsg);
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    onSuccess();
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      surnames: '',
      dateOfBirth: '',
      additionalInfo: '',
      gender: '',
      shape: '',
    });
    setFormErrors({});
    setCurrentPhoto(null);
    onClose();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !student) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setErrorMessage(t('dashboard.students.validation.fileInvalidType'));
      setErrorDialogOpen(true);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t('dashboard.students.validation.fileTooLarge'));
      setErrorDialogOpen(true);
      return;
    }

    setUploadingPhoto(true);
    try {
      await StudentService.uploadPhoto(student.id, file);
      invalidatePhoto(student.id);
      setCurrentPhoto(file.name);
      setSuccessMessage(t('dashboard.students.photoUploadSuccess'));
      setSuccessDialogOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.photoUploadError'));
      setErrorDialogOpen(true);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoDelete = async () => {
    if (!student) return;

    setUploadingPhoto(true);
    try {
      await StudentService.deletePhoto(student.id);
      invalidatePhoto(student.id);
      setCurrentPhoto(null);
      setSuccessMessage(t('dashboard.students.photoDeleteSuccess'));
      setSuccessDialogOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.photoDeleteError'));
      setErrorDialogOpen(true);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal-overlay" open={isOpen}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title">
                {student ? t('dashboard.students.editStudent') : t('dashboard.students.addStudent')}
              </h3>
              <button
                onClick={handleCancel}
                className="modal-button cancel"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Row 1: Name + Surnames */}
              <div className="modal-fields-row">
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">
                    {t('dashboard.students.name')} <span className="form-required-asterisk">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    className={`modal-input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder={t('dashboard.students.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={submitting}
                  />
                  {formErrors.name && <p className="form-error-text">{formErrors.name}</p>}
                </div>

                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">
                    {t('dashboard.students.surnames')} <span className="form-required-asterisk">*</span>
                  </label>
                  <input
                    ref={surnamesInputRef}
                    type="text"
                    className={`modal-input ${formErrors.surnames ? 'input-error' : ''}`}
                    placeholder={t('dashboard.students.surnamesPlaceholder')}
                    value={formData.surnames}
                    onChange={(e) => handleInputChange('surnames', e.target.value)}
                    disabled={submitting}
                  />
                  {formErrors.surnames && <p className="form-error-text">{formErrors.surnames}</p>}
                </div>
              </div>

              {/* Row 2: Date of Birth + Gender + Shape */}
              <div className="modal-fields-row">
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">
                    {t('dashboard.students.dateOfBirth')} <span className="form-required-asterisk">*</span>
                  </label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className={`modal-input ${formErrors.dateOfBirth ? 'input-error' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={submitting}
                  />
                  {formErrors.dateOfBirth && <p className="form-error-text">{formErrors.dateOfBirth}</p>}
                </div>

                {/* Gender Field */}
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">
                    {t('dashboard.students.gender')} <span className="form-required-asterisk">*</span>
                  </label>
                  <div className="shape-dropdown" ref={genderDropdownRef}>
                    <button
                      ref={genderInputRef}
                      type="button"
                      className={`shape-dropdown-trigger modal-input ${formErrors.gender ? 'input-error' : ''}`}
                      onClick={() => setGenderDropdownOpen(prev => !prev)}
                      disabled={submitting}
                      aria-haspopup="listbox"
                      aria-expanded={genderDropdownOpen}
                    >
                      <span className="shape-dropdown-selected">
                        {!formData.gender && <span className="shape-dropdown-placeholder">{t('dashboard.students.genderPlaceholder')}</span>}
                        {formData.gender === 'M' && <span>{t('dashboard.students.genderMale')}</span>}
                        {formData.gender === 'F' && <span>{t('dashboard.students.genderFemale')}</span>}
                      </span>
                      <ChevronDown size={16} className={`shape-dropdown-chevron ${genderDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {genderDropdownOpen && (
                      <div className="selector-dropdown" style={{ minWidth: '100%', top: 'calc(100% + 4px)' }}>
                        <button
                          type="button"
                          className="selector-option"
                          onClick={() => { handleInputChange('gender', ''); setGenderDropdownOpen(false); }}
                        >
                          <span style={{ color: '#a09890' }}>—</span>
                        </button>
                        <button
                          type="button"
                          className="selector-option"
                          onClick={() => { handleInputChange('gender', 'M'); setGenderDropdownOpen(false); }}
                        >
                          {t('dashboard.students.genderMale')}
                        </button>
                        <button
                          type="button"
                          className="selector-option"
                          onClick={() => { handleInputChange('gender', 'F'); setGenderDropdownOpen(false); }}
                        >
                          {t('dashboard.students.genderFemale')}
                        </button>
                      </div>
                    )}
                  </div>
                  {formErrors.gender && <p className="form-error-text">{formErrors.gender}</p>}
                </div>

                {/* Shape Field */}
                <div className="modal-field" style={{ flex: 0, minWidth: '80px' }}>
                  <label className="modal-label">
                    {t('dashboard.students.shape')}
                  </label>
                  <div className="shape-dropdown" ref={shapeDropdownRef}>
                  <button
                    ref={shapeTriggerRef}
                    type="button"
                    className="shape-dropdown-trigger modal-input"
                    onClick={() => setShapeDropdownOpen(prev => !prev)}
                    disabled={submitting}
                    aria-haspopup="listbox"
                    aria-expanded={shapeDropdownOpen}
                  >
                    <span className="shape-dropdown-selected">
                      {!formData.shape && <span className="shape-dropdown-placeholder">—</span>}
                      {formData.shape === 'CIRCLE' && (
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="9" fill="#ef4444" stroke="#000" strokeWidth="0.8"/>
                        </svg>
                      )}
                      {formData.shape === 'TRIANGLE' && (
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="12,3 22,21 2,21" fill="#3b82f6" stroke="#000" strokeWidth="0.8" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {formData.shape === 'SQUARE' && (
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" stroke="#000" strokeWidth="0.8"/>
                        </svg>
                      )}
                    </span>
                    <ChevronDown size={16} className={`shape-dropdown-chevron ${shapeDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {shapeDropdownOpen && shapeMenuPos && (
                    <div
                      className="shape-dropdown-menu"
                      style={{ position: 'fixed', top: shapeMenuPos.top, right: shapeMenuPos.right, left: 'auto', zIndex: 100 }}
                    >
                      {/* None */}
                      <button
                        type="button"
                        className={`shape-dropdown-item ${!formData.shape ? 'selected' : ''}`}
                        onClick={() => { handleInputChange('shape', ''); setShapeDropdownOpen(false); }}
                      >
                        <span className="shape-dropdown-placeholder">—</span>
                      </button>
                      {/* Circle */}
                      <button
                        type="button"
                        aria-label={t('dashboard.students.shapeCircle')}
                        className={`shape-dropdown-item ${formData.shape === 'CIRCLE' ? 'selected' : ''}`}
                        onClick={() => { handleInputChange('shape', 'CIRCLE'); setShapeDropdownOpen(false); }}
                      >
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="9" fill="#ef4444" stroke="#000" strokeWidth="0.8"/>
                        </svg>
                      </button>
                      {/* Triangle */}
                      <button
                        type="button"
                        aria-label={t('dashboard.students.shapeTriangle')}
                        className={`shape-dropdown-item ${formData.shape === 'TRIANGLE' ? 'selected' : ''}`}
                        onClick={() => { handleInputChange('shape', 'TRIANGLE'); setShapeDropdownOpen(false); }}
                      >
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="12,3 22,21 2,21" fill="#3b82f6" stroke="#000" strokeWidth="0.8" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {/* Square */}
                      <button
                        type="button"
                        aria-label={t('dashboard.students.shapeSquare')}
                        className={`shape-dropdown-item ${formData.shape === 'SQUARE' ? 'selected' : ''}`}
                        onClick={() => { handleInputChange('shape', 'SQUARE'); setShapeDropdownOpen(false); }}
                      >
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" stroke="#000" strokeWidth="0.8"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* Row 3: Additional Info */}
              <div className="modal-field">
                <label className="modal-label">
                  {t('dashboard.students.additionalInfo')}
                </label>
                <textarea
                  className="modal-input"
                  placeholder={t('dashboard.students.additionalInfoPlaceholder')}
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  disabled={submitting}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              {/* Photo Section (only for editing) */}
              {student && (
                <div className="photo-upload-section">
                  <h4 className="photo-upload-title">{t('dashboard.students.photo')}</h4>
                  <div className="photo-upload-preview">
                    <StudentPhoto
                      studentId={student.id}
                      photoFileName={currentPhoto}
                      gender={student.gender}
                      size={120}
                      alt={`${student.name} ${student.surnames}`}
                    />
                    <div className="photo-upload-buttons">
                      <label htmlFor="photo-upload" className="photo-upload-btn">
                        {uploadingPhoto ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Upload size={16} />
                        )}
                        {t('dashboard.students.uploadPhoto')}
                      </label>
                      <input
                        id="photo-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="photo-upload-input"
                      />
                      {currentPhoto && (
                        <button
                          type="button"
                          onClick={handlePhotoDelete}
                          disabled={uploadingPhoto}
                          className="photo-upload-btn delete"
                        >
                          <Trash2 size={16} />
                          {t('dashboard.students.deletePhoto')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <button
                onClick={handleCancel}
                className="modal-button cancel"
                disabled={submitting || uploadingPhoto}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="modal-button save"
                disabled={submitting || uploadingPhoto}
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <ErrorModal
        isOpen={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      <SuccessModal
        isOpen={successDialogOpen}
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </>
  );
}
