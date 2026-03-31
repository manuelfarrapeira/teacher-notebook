import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraduationCap, Loader2, Plus, Edit, Trash2, Search, Grid3x3, List, ClipboardList } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { SkillService, Skill } from '../../services/SkillService';
import { SkillRubricService } from '../../services/SkillRubricService';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { SkillRubricsModal } from '../modals/SkillRubricsModal';
import { useIsMobile } from '../../lib/utils';

/** Form error fields for skill creation/edition */
interface FormErrors {
  title?: string;
  description?: string;
}

/** Validates the title field and returns an error message or undefined */
function validateTitleField(title: string, t: (key: string) => string): string | undefined {
  if (title.length === 0) return t('dashboard.skills.validation.titleRequired');
  if (title.length < 3) return t('dashboard.skills.validation.titleMinLength');
  if (title.length > 200) return t('dashboard.skills.validation.titleMaxLength');
  return undefined;
}

/** Focuses the first field with an error */
function focusFirstErrorField(
  errors: FormErrors,
  titleRef: React.RefObject<HTMLInputElement | null>,
  descRef: React.RefObject<HTMLTextAreaElement | null>
): void {
  if (errors.title) {
    titleRef.current?.focus();
  } else if (errors.description) {
    descRef.current?.focus();
  }
}

/** Performs the create or update API call */
async function saveSkillApi(editingSkill: Skill | null, title: string, description: string): Promise<void> {
  if (editingSkill) {
    await SkillService.updateSkill(editingSkill.id, title, description);
  } else {
    await SkillService.createSkill(title, description);
  }
}

/**
 * SkillsTab component for managing skills/competencias (CRUD operations)
 * Allows listing, creating, editing and deleting skills
 */
export function SkillsTab() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillTitle, setSkillTitle] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('skillsViewMode');
    return saved === 'grid' ? 'grid' : 'list';
  });
  const effectiveViewMode = isMobile ? 'list' : viewMode;

  // Modal states
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Rubrics modal state
  const [showRubricsModal, setShowRubricsModal] = useState(false);
  const [selectedSkillForRubrics, setSelectedSkillForRubrics] = useState<Skill | null>(null);

  // Track skills that have at least one rubric
  const [skillsWithRubrics, setSkillsWithRubrics] = useState<Set<number>>(new Set());

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const filteredSkills = useMemo(() => {
    if (!searchTerm.trim()) return skills;
    const term = searchTerm.toLowerCase();
    return skills.filter(skill =>
      skill.title.toLowerCase().includes(term) ||
      skill.description.toLowerCase().includes(term)
    );
  }, [skills, searchTerm]);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [showForm]);

  useEffect(() => {
    localStorage.setItem('skillsViewMode', viewMode);
  }, [viewMode]);

  /** Displays an error in the error modal */
  const showError = (error: unknown, fallbackMsg: string) => {
    console.error('Skill operation error:', error);
    setErrorMessage(error instanceof Error ? error.message : fallbackMsg);
    setErrorDialogOpen(true);
  };

  /** Resets the form fields and closes it */
  const resetForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    setSkillTitle('');
    setSkillDescription('');
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await SkillService.getSkills();
      setSkills(data);
      fetchSkillsRubricsStatus(data);
    } catch (error) {
      showError(error, t('dashboard.skills.loadError'));
    } finally {
      setLoading(false);
    }
  };

  /** Fetches rubrics for each skill to determine which ones have at least one */
  const fetchSkillsRubricsStatus = async (skillList: Skill[]) => {
    const withRubrics = new Set<number>();
    await Promise.all(
      skillList.map(async (s) => {
        try {
          const rubrics = await SkillRubricService.getRubrics(s.id);
          if (Array.isArray(rubrics) && rubrics.length > 0) {
            withRubrics.add(s.id);
          }
        } catch {
          // Ignore errors – just won't highlight
        }
      })
    );
    setSkillsWithRubrics(withRubrics);
  };

  /** Refreshes rubric status for a single skill */
  const refreshSingleSkillRubricStatus = async (skillId: number) => {
    try {
      const rubrics = await SkillRubricService.getRubrics(skillId);
      setSkillsWithRubrics((prev) => {
        const next = new Set(prev);
        if (Array.isArray(rubrics) && rubrics.length > 0) {
          next.add(skillId);
        } else {
          next.delete(skillId);
        }
        return next;
      });
    } catch {
      // Ignore
    }
  };

  const validateForm = (): boolean => {
    const cleanErrors: FormErrors = {};
    const trimmedTitle = skillTitle.trim();
    const trimmedDescription = skillDescription.trim();

    const titleError = validateTitleField(trimmedTitle, t);
    if (titleError) cleanErrors.title = titleError;

    if (trimmedDescription.length > 200) {
      cleanErrors.description = t('dashboard.skills.validation.descriptionMaxLength');
    }

    setFormErrors(cleanErrors);
    focusFirstErrorField(cleanErrors, titleInputRef, descriptionInputRef);

    return Object.keys(cleanErrors).length === 0;
  };

  const handleTitleChange = (value: string) => {
    setSkillTitle(value);
    setFormErrors(prev => ({ ...prev, title: undefined }));
  };

  const handleDescriptionChange = (value: string) => {
    setSkillDescription(value);
    setFormErrors(prev => ({ ...prev, description: undefined }));
  };

  const handleAddClick = () => {
    setEditingSkill(null);
    setSkillTitle('');
    setSkillDescription('');
    setFormErrors({});
    setShowForm(true);
  };

  const handleEditClick = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillTitle(skill.title);
    setSkillDescription(skill.description);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteClick = (skill: Skill) => {
    setSkillToDelete(skill);
    setConfirmDeleteOpen(true);
  };

  const handleRubricsClick = (skill: Skill) => {
    setSelectedSkillForRubrics(skill);
    setShowRubricsModal(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setFormErrors({});
  };


  const handleSubmit = async () => {
    if (!validateForm()) return;

    const successMsg = editingSkill ? t('dashboard.skills.updateSuccess') : t('dashboard.skills.createSuccess');
    const errorFallback = editingSkill ? t('dashboard.skills.updateError') : t('dashboard.skills.createError');

    setSubmitting(true);
    try {
      await saveSkillApi(editingSkill, skillTitle.trim(), skillDescription.trim());
      setSuccessMessage(successMsg);
      setSuccessDialogOpen(true);
      resetForm();
      await fetchSkills();
    } catch (error) {
      showError(error, errorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;

    setDeleting(true);
    try {
      await SkillService.deleteSkill(skillToDelete.id);
      setSuccessMessage(t('dashboard.skills.deleteSuccess'));
      setSuccessDialogOpen(true);
      setConfirmDeleteOpen(false);
      setSkillToDelete(null);
      await fetchSkills();
    } catch (error) {
      showError(error, t('dashboard.skills.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setSkillToDelete(null);
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

  /** Returns the submit button content based on current state */
  const getSubmitButtonContent = () => {
    if (submitting) {
      return <Loader2 className="icon-spin" size={16} />;
    }
    if (editingSkill) {
      return t('dashboard.skills.update');
    }
    return t('dashboard.skills.create');
  };

  /** Renders the skills list, empty state, or no-results state */
  const renderSkillsList = () => {
    if (skills.length === 0) {
      return (
        <div className="dashboard-empty">
          <GraduationCap className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.skills.noSkills')}</p>
        </div>
      );
    }

    if (filteredSkills.length === 0) {
      return (
        <div className="dashboard-empty">
          <Search className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.skills.noResults')}</p>
        </div>
      );
    }

    return (
      <div className={effectiveViewMode === 'grid' ? 'skills-grid' : 'skills-list'}>
        {filteredSkills.map((skill) => (
          <div key={skill.id} className={`dashboard-student ${skillsWithRubrics.has(skill.id) ? 'skills-has-rubrics' : ''}`}>
            <div className="dashboard-student-info" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <GraduationCap size={20} style={{ color: '#2c5f4a', flexShrink: 0 }} />
                <span className="dashboard-student-name">{skill.title}</span>
              </div>
              {skill.description && (
                <p className="skills-description">{skill.description}</p>
              )}
            </div>
            <div className="school-card-actions">
              <button
                className="school-action-btn edit tooltip-container"
                onClick={() => handleRubricsClick(skill)}
                disabled={submitting || deleting}
                data-tooltip={t('dashboard.skills.rubrics.manageRubrics')}
                aria-label={t('dashboard.skills.rubrics.manageRubrics')}
              >
                <ClipboardList size={20} />
              </button>
              <button
                className="school-action-btn edit tooltip-container"
                onClick={() => handleEditClick(skill)}
                disabled={submitting || deleting}
                data-tooltip={t('dashboard.skills.edit')}
                aria-label={t('dashboard.skills.edit')}
              >
                <Edit size={20} />
              </button>
              <button
                className="school-action-btn delete tooltip-container"
                onClick={() => handleDeleteClick(skill)}
                disabled={submitting || deleting}
                data-tooltip={t('dashboard.skills.delete')}
                aria-label={t('dashboard.skills.delete')}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /** Renders the form modal for creating/editing skills */
  const renderFormModal = () => {
    if (!showForm) return null;

    const modalLabel = editingSkill ? t('dashboard.skills.editTitle') : t('dashboard.skills.createTitle');

    return (
      <dialog className="modal-overlay" open={showForm} aria-label={modalLabel}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="modal-content">
            <h3 className="modal-title">{modalLabel}</h3>
            <div className="modal-body">
              <label className="modal-label">
                {t('dashboard.skills.titleLabel')} <span className="form-required-asterisk">*</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                className={`modal-input ${formErrors.title ? 'input-error' : ''}`}
                placeholder={t('dashboard.skills.titlePlaceholder')}
                value={skillTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                maxLength={200}
                disabled={submitting}
              />
              {formErrors.title && (
                <p className="form-error-text">{formErrors.title}</p>
              )}

              <label className="modal-label" style={{ marginTop: '1rem' }}>
                {t('dashboard.skills.description')}
              </label>
              <textarea
                ref={descriptionInputRef}
                className={`modal-input ${formErrors.description ? 'input-error' : ''}`}
                placeholder={t('dashboard.skills.descriptionPlaceholder')}
                value={skillDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                maxLength={200}
                disabled={submitting}
                rows={3}
                style={{ resize: 'vertical', minHeight: '4rem' }}
              />
              {formErrors.description && (
                <p className="form-error-text">{formErrors.description}</p>
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
                {getSubmitButtonContent()}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    );
  };

  /** Renders the header with search, view toggle and add button */
  const renderHeader = () => {
    const hasSkills = skills.length > 0;
    const showViewToggle = Boolean(hasSkills && !isMobile);

    return (
      <div className="dashboard-section-header" style={{ justifyContent: 'flex-start' }}>
        {hasSkills && (
          <div className="student-search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <div className="student-search-wrapper">
              <Search className="student-search-icon" size={18} />
              <input
                type="text"
                className="student-search-input"
                placeholder={t('dashboard.skills.searchSkills')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {showViewToggle && (
          <div className="view-toggle-group">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label={t('dashboard.skills.gridView')}
              title={t('dashboard.skills.gridView')}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              aria-label={t('dashboard.skills.listView')}
              title={t('dashboard.skills.listView')}
            >
              <List size={18} />
            </button>
          </div>
        )}

        <button className="dashboard-add-btn" style={{ marginLeft: hasSkills ? '0' : 'auto' }} onClick={handleAddClick}>
          <Plus size={16} />
          {t('dashboard.skills.addNew')}
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard-card">
      {/* Header: Search, View Toggle, Add Button */}
      {renderHeader()}

      {/* Form Modal */}
      {renderFormModal()}

      {/* Skills List */}
      {renderSkillsList()}

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
        itemName={skillToDelete?.title ?? ''}
        title={t('dashboard.skills.deleteTitle')}
        confirmMessage={t('dashboard.skills.deleteConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleting}
      />

      <SkillRubricsModal
        isOpen={showRubricsModal}
        onClose={() => {
          if (selectedSkillForRubrics) {
            refreshSingleSkillRubricStatus(selectedSkillForRubrics.id);
          }
          setShowRubricsModal(false);
          setSelectedSkillForRubrics(null);
        }}
        skill={selectedSkillForRubrics}
      />
    </div>
  );
}

