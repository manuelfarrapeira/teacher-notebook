import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Student, StudentService } from '../../services/StudentService';
import { School } from '../../services/SchoolService';
import { ErrorModal } from './ErrorModal';
import { SuccessModal } from './SuccessModal';

interface AssignToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student;
  schools: School[];
}

export function AssignToClassModal({
  isOpen,
  onClose,
  onSuccess,
  student,
  schools
}: Readonly<AssignToClassModalProps>) {
  const { t } = useI18n();
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const currentSchool = schools.find(s => s.id === selectedSchoolId);

  const handleAssign = async () => {
    if (!selectedSchoolId || !selectedClassId) return;

    setSubmitting(true);
    try {
      await StudentService.assignToClass(selectedClassId, student.id);
      setSuccessDialogOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.assignError'));
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

  const handleClose = () => {
    setSelectedSchoolId(null);
    setSelectedClassId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal-overlay" open={isOpen}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '450px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title">{t('dashboard.students.selectSchoolAndClass')}</h3>
              <button
                onClick={handleClose}
                className="modal-button cancel"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
                aria-label={t('common.close')}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="student-card-name" style={{ marginBottom: '1rem' }}>
                {student.name} {student.surnames}
              </p>

              {/* School Selector */}
              <div className="modal-field">
                <label className="modal-label">
                  {t('dashboard.students.selectSchool')} <span className="form-required-asterisk">*</span>
                </label>
                <select
                  className="modal-input"
                  value={selectedSchoolId || ''}
                  onChange={(e) => {
                    setSelectedSchoolId(Number(e.target.value));
                    setSelectedClassId(null);
                  }}
                  disabled={submitting}
                >
                  <option value="">{t('dashboard.students.selectSchool')}</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Selector */}
              <div className="modal-field">
                <label className="modal-label">
                  {t('dashboard.students.selectClass')} <span className="form-required-asterisk">*</span>
                </label>
                <select
                  className="modal-input"
                  value={selectedClassId || ''}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  disabled={!selectedSchoolId || submitting}
                >
                  <option value="">{t('dashboard.students.selectClass')}</option>
                  {currentSchool?.classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.schoolYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleClose}
                className="modal-button cancel"
                disabled={submitting}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAssign}
                className="modal-button save"
                disabled={!selectedSchoolId || !selectedClassId || submitting}
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                {t('dashboard.students.assignToClass')}
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
        message={t('dashboard.students.assignSuccess')}
        onClose={handleSuccessClose}
      />
    </>
  );
}
