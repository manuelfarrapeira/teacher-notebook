import React, { useState, useEffect, useRef } from 'react';
import { Loader2, X, ChevronDown } from 'lucide-react';
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

  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const classDropdownRef = useRef<HTMLDivElement>(null);
  const schoolButtonRef = useRef<HTMLButtonElement>(null);

  const currentSchool = schools.find(s => s.id === selectedSchoolId);
  const selectedClass = currentSchool?.classes.find(c => c.id === selectedClassId);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => schoolButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSchoolId(null);
      setSelectedClassId(null);
      setSchoolDropdownOpen(false);
      setClassDropdownOpen(false);
    }
  }, [isOpen]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
        setSchoolDropdownOpen(false);
      }
    };
    if (schoolDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [schoolDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setClassDropdownOpen(false);
      }
    };
    if (classDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [classDropdownOpen]);

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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
          <div className="modal-content" style={{ maxWidth: '450px', width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
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
                <div className="shape-dropdown" ref={schoolDropdownRef}>
                  <button
                    ref={schoolButtonRef}
                    type="button"
                    className="shape-dropdown-trigger modal-input"
                    onClick={() => { setSchoolDropdownOpen(prev => !prev); setClassDropdownOpen(false); }}
                    disabled={submitting}
                    aria-haspopup="listbox"
                    aria-expanded={schoolDropdownOpen}
                  >
                    <span className="shape-dropdown-selected">
                      {selectedSchoolId
                        ? <span>{currentSchool?.name}</span>
                        : <span className="shape-dropdown-placeholder">{t('dashboard.students.selectSchool')}</span>
                      }
                    </span>
                    <ChevronDown size={16} className={`shape-dropdown-chevron ${schoolDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {schoolDropdownOpen && (
                    <div className="selector-dropdown" style={{ minWidth: '100%', top: 'calc(100% + 4px)', maxHeight: '200px', overflowY: 'auto' }}>
                      {schools.map(school => (
                        <button
                          key={school.id}
                          type="button"
                          className="selector-option"
                          onClick={() => {
                            setSelectedSchoolId(school.id);
                            setSelectedClassId(null);
                            setSchoolDropdownOpen(false);
                          }}
                        >
                          {school.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Class Selector */}
              <div className="modal-field">
                <label className="modal-label">
                  {t('dashboard.students.selectClass')} <span className="form-required-asterisk">*</span>
                </label>
                <div className="shape-dropdown" ref={classDropdownRef}>
                  <button
                    type="button"
                    className="shape-dropdown-trigger modal-input"
                    onClick={() => { setClassDropdownOpen(prev => !prev); setSchoolDropdownOpen(false); }}
                    disabled={!selectedSchoolId || submitting}
                    aria-haspopup="listbox"
                    aria-expanded={classDropdownOpen}
                  >
                    <span className="shape-dropdown-selected">
                      {selectedClassId && selectedClass
                        ? <span>{selectedClass.name} - {selectedClass.schoolYear}</span>
                        : <span className="shape-dropdown-placeholder">{t('dashboard.students.selectClass')}</span>
                      }
                    </span>
                    <ChevronDown size={16} className={`shape-dropdown-chevron ${classDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {classDropdownOpen && currentSchool && (
                    <div className="selector-dropdown" style={{ minWidth: '100%', top: 'calc(100% + 4px)', maxHeight: '200px', overflowY: 'auto' }}>
                      {currentSchool.classes.map(cls => (
                        <button
                          key={cls.id}
                          type="button"
                          className="selector-option"
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setClassDropdownOpen(false);
                          }}
                        >
                          {cls.name} - {cls.schoolYear}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem', gap: '0.75rem' }}>
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
