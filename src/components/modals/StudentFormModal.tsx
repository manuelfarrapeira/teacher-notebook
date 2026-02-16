import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { StudentService, Student, StudentRequestDTO, Gender } from '../../services/StudentService';
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
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const surnamesInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const genderInputRef = useRef<HTMLSelectElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        surnames: student.surnames,
        dateOfBirth: formatDateForInput(student.dateOfBirth),
        additionalInfo: student.additionalInfo,
        gender: student.gender || '',
      });
      setCurrentPhoto(student.photo);
    }
  }, [student]);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
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
              {/* Name Field */}
              <div className="modal-field">
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

              {/* Surnames Field */}
              <div className="modal-field">
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

              {/* Date of Birth Field */}
              <div className="modal-field">
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
              <div className="modal-field">
                <label className="modal-label">
                  {t('dashboard.students.gender')} <span className="form-required-asterisk">*</span>
                </label>
                <select
                  ref={genderInputRef}
                  className={`modal-input ${formErrors.gender ? 'input-error' : ''}`}
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={submitting}
                >
                  <option value="">{t('dashboard.students.genderPlaceholder')}</option>
                  <option value="M">{t('dashboard.students.genderMale')}</option>
                  <option value="F">{t('dashboard.students.genderFemale')}</option>
                </select>
                {formErrors.gender && <p className="form-error-text">{formErrors.gender}</p>}
              </div>

              {/* Additional Info Field */}
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

            <div className="modal-footer">
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
