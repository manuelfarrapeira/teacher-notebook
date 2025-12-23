import React, { useState, useEffect, useRef } from 'react';
import { Building2, Plus, Loader2, Trash2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { SchoolService, School, SchoolRequestDTO } from '../../services/SchoolService';
import { ApiErrorException } from '../../services/BaseService';

interface FormData {
  name: string;
  town: string;
  tlf: string;
}

interface FormErrors {
  name?: string;
  tlf?: string;
}

function useFocusTrap(isOpen: boolean, modalRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusableSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ];
    const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(','));
    if (focusableEls.length > 0) focusableEls[0].focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(focusableEls).filter(el => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.slice(-1)[0];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    modalRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, modalRef]);
}

export function SchoolsTab() {
  const { t } = useI18n();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    town: '',
    tlf: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Refs for modals
  const errorModalRef = useRef<HTMLDivElement>(null);
  const successModalRef = useRef<HTMLDivElement>(null);
  const confirmDeleteModalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(errorDialogOpen, errorModalRef);
  useFocusTrap(successDialogOpen, successModalRef);
  useFocusTrap(confirmDeleteOpen, confirmDeleteModalRef);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const schoolData = await SchoolService.getSchools();
      setSchools(schoolData);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.schools.createError'));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = t('dashboard.schools.validation.nameRequired');
    } else if (formData.name.trim().length < 5) {
      errors.name = t('dashboard.schools.validation.nameMinLength');
    }

    // Validar teléfono (opcional)
    if (formData.tlf.trim()) {
      const phoneRegex = /^\d{9}$/;
      if (!phoneRegex.test(formData.tlf.trim())) {
        errors.tlf = t('dashboard.schools.validation.phoneInvalid');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const requestData: SchoolRequestDTO = {
        name: formData.name.trim(),
      };

      if (formData.town.trim()) {
        requestData.town = formData.town.trim();
      }

      if (formData.tlf.trim()) {
        requestData.tlf = Number.parseInt(formData.tlf.trim(), 10);
      }

      await SchoolService.createSchool(requestData);

      // Resetear formulario
      setFormData({ name: '', town: '', tlf: '' });
      setShowForm(false);
      setSuccessDialogOpen(true);

      // Refrescar lista de colegios
      await fetchSchools();
    } catch (error) {
      console.error('Error creating school:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.schools.createError'));
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', town: '', tlf: '' });
    setFormErrors({});
    setShowForm(false);
  };

  const handleDeleteClick = (school: School) => {
    setSchoolToDelete(school);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!schoolToDelete) return;
    setDeleting(true);
    try {
      await SchoolService.deleteSchool(schoolToDelete.id);
      setConfirmDeleteOpen(false);
      setSchoolToDelete(null);
      await fetchSchools();
    } catch (error: unknown) {
      console.log('ERROR JSON AL ELIMINAR COLEGIO:', error);
      setConfirmDeleteOpen(false);
      setSchoolToDelete(null);
      let message = t('dashboard.schools.deleteError');
      if (error instanceof ApiErrorException) {
        message = error.apiError.detail || error.apiError.description || error.apiError.code;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setErrorMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to render school list
  const renderSchoolList = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <Loader2 className="icon-spin" size={32} />
        </div>
      );
    }

    if (schools.length === 0) {
      return (
        <div className="dashboard-empty">
          <Building2 className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.schools.noSchools')}</p>
        </div>
      );
    }

    return (
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          {t('dashboard.schools.list')}
        </h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {schools.map((school) => (
            <div
              key={school.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                backgroundColor: 'white',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={20} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{school.name}</h4>
                </div>
                <button
                  className="modal-button cancel"
                  style={{ padding: '0.25rem', fontSize: '1rem', color: '#dc2626', borderColor: 'transparent', background: 'none', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => handleDeleteClick(school)}
                  disabled={deleting}
                  title={t('dashboard.schools.delete')}
                  aria-label={t('dashboard.schools.delete')}
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {Boolean(school.town) && (
                  <p style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{t('dashboard.schools.town')}:</span> {school.town}
                  </p>
                )}
                {Boolean(school.tlf) && (
                  <p style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{t('dashboard.schools.phone')}:</span> {school.tlf}
                  </p>
                )}
                <p>
                  <span style={{ fontWeight: 500 }}>{t('dashboard.tabs.classes')}:</span> {school.classes.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.schools.title')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="dashboard-add-btn"
          disabled={loading || submitting}
        >
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          {t('dashboard.schools.addNew')}
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="modal-content" style={{ marginBottom: '1.5rem', maxWidth: '100%' }}>
          <h3 className="modal-title">{t('dashboard.schools.addNew')}</h3>
          <form onSubmit={handleSubmit} className="modal-body">
            <div>
              <label className="login-label">
                {t('dashboard.schools.name')} <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                id="name"
                className="modal-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('dashboard.schools.namePlaceholder')}
                disabled={submitting}
              />
              {formErrors.name && (
                <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {formErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="login-label">{t('dashboard.schools.town')}</label>
              <input
                id="town"
                className="modal-input"
                value={formData.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
                placeholder={t('dashboard.schools.townPlaceholder')}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="login-label">{t('dashboard.schools.phone')}</label>
              <input
                id="tlf"
                type="text"
                inputMode="numeric"
                className="modal-input"
                value={formData.tlf}
                onChange={(e) => handleInputChange('tlf', e.target.value)}
                placeholder={t('dashboard.schools.phonePlaceholder')}
                disabled={submitting}
                maxLength={9}
              />
              {formErrors.tlf && (
                <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {formErrors.tlf}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-button cancel"
                onClick={handleCancel}
                disabled={submitting}
              >
                {t('dashboard.schools.cancel')}
              </button>
              <button
                type="submit"
                className="modal-button save"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {submitting && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
                {t('dashboard.schools.submit')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de colegios */}
      {renderSchoolList()}

      {/* Error Dialog */}
      {errorDialogOpen && (
        <dialog
          className="modal-overlay"
          open={errorDialogOpen}
          aria-label={t('common.error')}
          onClose={() => setErrorDialogOpen(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div
              className="modal-content"
              ref={errorModalRef}
            >
              <h3 className="modal-title" style={{ color: '#dc2626' }}>
                ❌ {t('common.error')}
              </h3>
              <div className="modal-body">
                <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-button save"
                  onClick={() => setErrorDialogOpen(false)}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Success Dialog */}
      {successDialogOpen && (
        <dialog
          className="modal-overlay"
          open={successDialogOpen}
          aria-label={t('common.success')}
          onClose={() => setSuccessDialogOpen(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div
              className="modal-content"
              ref={successModalRef}
            >
              <h3 className="modal-title" style={{ color: '#16a34a' }}>
                ✅ {t('common.success')}
              </h3>
              <div className="modal-body">
                <p>{t('dashboard.schools.createSuccess')}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-button save"
                  onClick={() => setSuccessDialogOpen(false)}
                  style={{ backgroundColor: '#16a34a' }}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteOpen && schoolToDelete && (
        <dialog
          className="modal-overlay"
          open={confirmDeleteOpen}
          aria-label={t('dashboard.schools.deleteTitle')}
          onClose={() => setConfirmDeleteOpen(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div
              className="modal-content"
              ref={confirmDeleteModalRef}
            >
              <h3 className="modal-title" style={{ color: '#dc2626' }}>{t('dashboard.schools.deleteTitle')}</h3>
              <div className="modal-body">
                <p>{t('dashboard.schools.deleteConfirm').replace('{name}', schoolToDelete.name)}</p>
              </div>
              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button
                  className="modal-button cancel"
                  onClick={() => setConfirmDeleteOpen(false)}
                  disabled={deleting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="modal-button save"
                  style={{ backgroundColor: '#dc2626' }}
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
                  {t('dashboard.schools.deleteConfirmBtn')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

