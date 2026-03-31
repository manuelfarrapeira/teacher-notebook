import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BookType, Loader2, Plus, Edit, Trash2, Search, Grid3x3, List } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { SubjectService, Subject } from '../../services/SubjectService';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { useIsMobile } from '../../lib/utils';

interface FormErrors {
  name?: string;
}

/**
 * SubjectsTab component for managing subjects (CRUD operations)
 * Allows listing, creating, editing and deleting subjects
 */
export function SubjectsTab() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('subjectsViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'list';
  });
  const effectiveViewMode = isMobile ? 'list' : viewMode;

  // Modal states
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return subjects;
    const term = searchTerm.toLowerCase();
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(term)
    );
  }, [subjects, searchTerm]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [showForm]);

  useEffect(() => {
    localStorage.setItem('subjectsViewMode', viewMode);
  }, [viewMode]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await SubjectService.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.subjects.loadError'));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = subjectName.trim();

    if (trimmedName.length === 0) {
      errors.name = t('dashboard.subjects.validation.nameRequired');
    } else if (trimmedName.length < 3) {
      errors.name = t('dashboard.subjects.validation.nameMinLength');
    }

    setFormErrors(errors);

    if (errors.name) {
      nameInputRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (value: string) => {
    setSubjectName(value);
    if (formErrors.name) {
      setFormErrors({});
    }
  };

  const handleAddClick = () => {
    setEditingSubject(null);
    setSubjectName('');
    setFormErrors({});
    setShowForm(true);
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setConfirmDeleteOpen(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSubject(null);
    setSubjectName('');
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingSubject) {
        await SubjectService.updateSubject(editingSubject.id, subjectName.trim());
        setSuccessMessage(t('dashboard.subjects.updateSuccess'));
      } else {
        await SubjectService.createSubject(subjectName.trim());
        setSuccessMessage(t('dashboard.subjects.createSuccess'));
      }
      setSuccessDialogOpen(true);
      setShowForm(false);
      setEditingSubject(null);
      setSubjectName('');
      await fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      const errorMsg = editingSubject
        ? t('dashboard.subjects.updateError')
        : t('dashboard.subjects.createError');
      setErrorMessage(error instanceof Error ? error.message : errorMsg);
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;

    setDeleting(true);
    try {
      await SubjectService.deleteSubject(subjectToDelete.id);
      setSuccessMessage(t('dashboard.subjects.deleteSuccess'));
      setSuccessDialogOpen(true);
      setConfirmDeleteOpen(false);
      setSubjectToDelete(null);
      await fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.subjects.deleteError'));
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setSubjectToDelete(null);
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-empty">
          <Loader2 className="dashboard-empty-icon icon-spin" />
          <p className="dashboard-empty-text">{t('dashboard.loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      {/* Header: Search, View Toggle, Add Button */}
      <div className="dashboard-section-header" style={{ justifyContent: 'flex-start' }}>
        {subjects.length > 0 && (
          <div className="student-search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <div className="student-search-wrapper">
              <Search className="student-search-icon" size={18} />
              <input
                type="text"
                className="student-search-input"
                placeholder={t('dashboard.subjects.searchSubjects')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {subjects.length > 0 && !isMobile && (
          <div className="view-toggle-group">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label={t('dashboard.subjects.gridView')}
              title={t('dashboard.subjects.gridView')}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              aria-label={t('dashboard.subjects.listView')}
              title={t('dashboard.subjects.listView')}
            >
              <List size={18} />
            </button>
          </div>
        )}

        <button className="dashboard-add-btn" style={{ marginLeft: subjects.length > 0 ? '0' : 'auto' }} onClick={handleAddClick}>
          <Plus size={16} />
          {t('dashboard.subjects.addNew')}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <dialog className="modal-overlay" open={showForm} aria-label={editingSubject ? t('dashboard.subjects.editTitle') : t('dashboard.subjects.createTitle')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 className="modal-title">
                {editingSubject ? t('dashboard.subjects.editTitle') : t('dashboard.subjects.createTitle')}
              </h3>
              <div className="modal-body">
                <label className="modal-label">
                  {t('dashboard.subjects.name')} <span className="form-required-asterisk">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  className={`modal-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder={t('dashboard.subjects.namePlaceholder')}
                  value={subjectName}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={submitting}
                />
                {formErrors.name && (
                  <p className="form-error-text">{formErrors.name}</p>
                )}
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
                  {submitting ? (
                    <Loader2 className="icon-spin" size={16} />
                  ) : editingSubject ? (
                    t('dashboard.subjects.update')
                  ) : (
                    t('dashboard.subjects.create')
                  )}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="dashboard-empty">
          <BookType className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.subjects.noSubjects')}</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="dashboard-empty">
          <Search className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.subjects.noResults')}</p>
        </div>
      ) : (
        <div className={effectiveViewMode === 'grid' ? 'subjects-grid' : 'subjects-list'}>
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="dashboard-student">
              <div className="dashboard-student-info">
                <BookType size={20} style={{ color: '#2c5f4a', marginRight: '0.75rem' }} />
                <span className="dashboard-student-name">{subject.name}</span>
              </div>
              <div className="school-card-actions">
                <button
                  className="school-action-btn edit tooltip-container"
                  onClick={() => handleEditClick(subject)}
                  disabled={submitting || deleting}
                  data-tooltip={t('dashboard.subjects.edit')}
                  aria-label={t('dashboard.subjects.edit')}
                >
                  <Edit size={20} />
                </button>
                <button
                  className="school-action-btn delete tooltip-container"
                  onClick={() => handleDeleteClick(subject)}
                  disabled={submitting || deleting}
                  data-tooltip={t('dashboard.subjects.delete')}
                  aria-label={t('dashboard.subjects.delete')}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ErrorModal
        isOpen={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      <SuccessModal
        isOpen={successDialogOpen}
        message={successMessage}
        onClose={() => setSuccessDialogOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        itemName={subjectToDelete?.name ?? ''}
        title={t('dashboard.subjects.deleteTitle')}
        confirmMessage={t('dashboard.subjects.deleteConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleting}
      />
    </div>
  );
}

