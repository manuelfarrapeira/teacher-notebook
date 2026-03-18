import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Loader2, Plus, Edit, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Skill } from '../../services/SkillService';
import {
  SkillRubricService,
  SkillRubric,
  SkillCriterion,
} from '../../services/SkillRubricService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ErrorModal } from './ErrorModal';
import { SuccessModal } from './SuccessModal';

// ========================
// Portal Tooltip
// ========================

/**
 * Tooltip rendered via portal so it escapes any overflow container.
 * Wraps children in a `<span>` to avoid nesting interactive elements.
 */
function PortalTooltip({ text, children }: {
  readonly text: string;
  readonly children: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
      {visible && ReactDOM.createPortal(
        <div
          className="skill-rubrics-portal-tooltip"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: 'translate(-50%, -100%)',
            zIndex: 10000,
          }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}

// ========================
// Props
// ========================

/** Props for SkillRubricsModal */
interface SkillRubricsModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Skill whose rubrics are managed */
  readonly skill: Skill | null;
}

// ========================
// Form-error types
// ========================

interface RubricFormErrors {
  title?: string;
}

interface CriterionFormErrors {
  description?: string;
  gradeStart?: string;
  gradeEnd?: string;
  overlap?: string;
}

// ========================
// Helpers
// ========================

/** Generates the 0-10 options for a grade dropdown */
const GRADE_OPTIONS = Array.from({ length: 11 }, (_, i) => i);

/**
 * Checks whether `[start, end]` overlaps with any existing criterion,
 * optionally excluding one criterion (the one being edited).
 */
function hasOverlap(
  start: number,
  end: number,
  existing: SkillCriterion[],
  excludeId?: number,
): boolean {
  return existing
    .filter((c) => c.id !== excludeId)
    .some((c) => start <= c.gradeEnd && end >= c.gradeStart);
}

// ========================
// Component
// ========================

/**
 * Modal for managing rubrics and criteria of a single skill.
 * Each rubric is an accordion that expands to show/manage its criteria.
 */
export function SkillRubricsModal({ isOpen, onClose, skill }: SkillRubricsModalProps) {
  const { t } = useI18n();

  /** Returns the appropriate submit label based on editing state */
  const getSubmitLabel = (isEditing: boolean): string =>
    isEditing ? t('dashboard.skills.update') : t('dashboard.skills.create');

  // ---- Rubric state ----
  const [rubrics, setRubrics] = useState<SkillRubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRubricId, setExpandedRubricId] = useState<number | null>(null);

  // Rubric form
  const [showRubricForm, setShowRubricForm] = useState(false);
  const [editingRubric, setEditingRubric] = useState<SkillRubric | null>(null);
  const [rubricTitle, setRubricTitle] = useState('');
  const [rubricFormErrors, setRubricFormErrors] = useState<RubricFormErrors>({});
  const [submittingRubric, setSubmittingRubric] = useState(false);
  const rubricTitleRef = useRef<HTMLInputElement>(null);

  // ---- Criterion state ----
  const [criteriaMap, setCriteriaMap] = useState<Record<number, SkillCriterion[]>>({});
  const [loadingCriteria, setLoadingCriteria] = useState<number | null>(null);

  // Criterion form
  const [showCriterionForm, setShowCriterionForm] = useState(false);
  const [criterionRubricId, setCriterionRubricId] = useState<number | null>(null);
  const [editingCriterion, setEditingCriterion] = useState<SkillCriterion | null>(null);
  const [criterionDescription, setCriterionDescription] = useState('');
  const [criterionGradeStart, setCriterionGradeStart] = useState(0);
  const [criterionGradeEnd, setCriterionGradeEnd] = useState(0);
  const [criterionFormErrors, setCriterionFormErrors] = useState<CriterionFormErrors>({});
  const [submittingCriterion, setSubmittingCriterion] = useState(false);
  const criterionDescRef = useRef<HTMLTextAreaElement>(null);

  // ---- Delete state ----
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'rubric' | 'criterion'; rubricId: number; criterionId?: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Feedback modals ----
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ========================
  // Data fetching
  // ========================

  const fetchRubrics = useCallback(async () => {
    if (!skill) return;
    setLoading(true);
    try {
      const data = await SkillRubricService.getRubrics(skill.id);
      setRubrics(Array.isArray(data) ? data : []);
      // Update criteriaMap from rubrics that include criteria
      const map: Record<number, SkillCriterion[]> = {};
      for (const r of data) {
        if (r.criteria) map[r.id] = r.criteria;
      }
      setCriteriaMap((prev) => ({ ...prev, ...map }));
    } catch (error) {
      showError(error, t('dashboard.skills.rubrics.loadError'));
    } finally {
      setLoading(false);
    }
  }, [skill]);

  const fetchCriteria = useCallback(async (rubricId: number) => {
    setLoadingCriteria(rubricId);
    try {
      const data = await SkillRubricService.getCriteria(rubricId);
      setCriteriaMap((prev) => ({ ...prev, [rubricId]: Array.isArray(data) ? data : [] }));
    } catch (error) {
      showError(error, t('dashboard.skills.rubrics.loadError'));
    } finally {
      setLoadingCriteria(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen && skill) {
      fetchRubrics();
    }
    if (!isOpen) {
      resetAll();
    }
  }, [isOpen, skill]);

  // ========================
  // Helpers
  // ========================

  const showError = (error: unknown, fallback: string) => {
    setErrorMsg(error instanceof Error ? error.message : fallback);
    setErrorOpen(true);
  };

  const resetAll = () => {
    setRubrics([]);
    setCriteriaMap({});
    setExpandedRubricId(null);
    resetRubricForm();
    resetCriterionForm();
  };

  // ---- Rubric form helpers ----

  const resetRubricForm = () => {
    setShowRubricForm(false);
    setEditingRubric(null);
    setRubricTitle('');
    setRubricFormErrors({});
  };

  const openRubricCreate = () => {
    setEditingRubric(null);
    setRubricTitle('');
    setRubricFormErrors({});
    setShowRubricForm(true);
    setTimeout(() => rubricTitleRef.current?.focus(), 50);
  };

  const openRubricEdit = (rubric: SkillRubric) => {
    setEditingRubric(rubric);
    setRubricTitle(rubric.title);
    setRubricFormErrors({});
    setShowRubricForm(true);
    setTimeout(() => rubricTitleRef.current?.focus(), 50);
  };

  const validateRubricForm = (): boolean => {
    const errors: RubricFormErrors = {};
    const trimmed = rubricTitle.trim();
    if (trimmed.length === 0) errors.title = t('dashboard.skills.rubrics.validation.titleRequired');
    else if (trimmed.length > 200) errors.title = t('dashboard.skills.rubrics.validation.titleMaxLength');
    setRubricFormErrors(errors);
    if (errors.title) rubricTitleRef.current?.focus();
    return Object.keys(errors).length === 0;
  };

  const handleRubricSubmit = async () => {
    if (!validateRubricForm() || !skill) return;
    setSubmittingRubric(true);
    try {
      if (editingRubric) {
        await SkillRubricService.updateRubric(editingRubric.id, rubricTitle.trim());
        setSuccessMsg(t('dashboard.skills.rubrics.updateRubricSuccess'));
      } else {
        await SkillRubricService.createRubric(skill.id, rubricTitle.trim());
        setSuccessMsg(t('dashboard.skills.rubrics.createRubricSuccess'));
      }
      setSuccessOpen(true);
      resetRubricForm();
      await fetchRubrics();
    } catch (error) {
      showError(error, editingRubric ? t('dashboard.skills.rubrics.updateRubricError') : t('dashboard.skills.rubrics.createRubricError'));
    } finally {
      setSubmittingRubric(false);
    }
  };

  // ---- Criterion form helpers ----

  const resetCriterionForm = () => {
    setShowCriterionForm(false);
    setCriterionRubricId(null);
    setEditingCriterion(null);
    setCriterionDescription('');
    setCriterionGradeStart(0);
    setCriterionGradeEnd(0);
    setCriterionFormErrors({});
  };

  const openCriterionCreate = (rubricId: number) => {
    setEditingCriterion(null);
    setCriterionRubricId(rubricId);
    setCriterionDescription('');
    setCriterionGradeStart(0);
    setCriterionGradeEnd(0);
    setCriterionFormErrors({});
    setShowCriterionForm(true);
    setTimeout(() => criterionDescRef.current?.focus(), 50);
  };

  const openCriterionEdit = (rubricId: number, criterion: SkillCriterion) => {
    setEditingCriterion(criterion);
    setCriterionRubricId(rubricId);
    setCriterionDescription(criterion.description);
    setCriterionGradeStart(criterion.gradeStart);
    setCriterionGradeEnd(criterion.gradeEnd);
    setCriterionFormErrors({});
    setShowCriterionForm(true);
    setTimeout(() => criterionDescRef.current?.focus(), 50);
  };

  const validateCriterionForm = (): boolean => {
    const errors: CriterionFormErrors = {};
    const trimmedDesc = criterionDescription.trim();

    if (trimmedDesc.length === 0) errors.description = t('dashboard.skills.rubrics.validation.descriptionRequired');
    else if (trimmedDesc.length > 200) errors.description = t('dashboard.skills.rubrics.validation.descriptionMaxLength');

    if (criterionGradeEnd < criterionGradeStart) {
      errors.gradeEnd = t('dashboard.skills.rubrics.validation.gradeEndGreaterOrEqual');
    }

    // Check overlap
    if (!errors.gradeEnd && criterionRubricId !== null) {
      const existing = criteriaMap[criterionRubricId] ?? [];
      if (hasOverlap(criterionGradeStart, criterionGradeEnd, existing, editingCriterion?.id)) {
        errors.overlap = t('dashboard.skills.rubrics.validation.gradeOverlap');
      }
    }

    setCriterionFormErrors(errors);
    if (errors.description) criterionDescRef.current?.focus();
    return Object.keys(errors).length === 0;
  };

  const handleCriterionSubmit = async () => {
    if (!validateCriterionForm() || criterionRubricId === null) return;
    setSubmittingCriterion(true);
    const data = {
      description: criterionDescription.trim(),
      gradeStart: criterionGradeStart,
      gradeEnd: criterionGradeEnd,
    };
    try {
      if (editingCriterion) {
        await SkillRubricService.updateCriterion(criterionRubricId, editingCriterion.id, data);
        setSuccessMsg(t('dashboard.skills.rubrics.updateCriterionSuccess'));
      } else {
        await SkillRubricService.createCriterion(criterionRubricId, data);
        setSuccessMsg(t('dashboard.skills.rubrics.createCriterionSuccess'));
      }
      setSuccessOpen(true);
      resetCriterionForm();
      await fetchCriteria(criterionRubricId);
    } catch (error) {
      showError(error, editingCriterion ? t('dashboard.skills.rubrics.updateCriterionError') : t('dashboard.skills.rubrics.createCriterionError'));
    } finally {
      setSubmittingCriterion(false);
    }
  };

  // ---- Accordion ----

  const toggleAccordion = async (rubricId: number) => {
    if (expandedRubricId === rubricId) {
      setExpandedRubricId(null);
      resetCriterionForm();
      return;
    }
    setExpandedRubricId(rubricId);
    resetCriterionForm();
    if (!criteriaMap[rubricId]) {
      await fetchCriteria(rubricId);
    }
  };

  // ---- Delete ----

  const requestDeleteRubric = (rubric: SkillRubric) => {
    setDeleteTarget({ type: 'rubric', rubricId: rubric.id, name: rubric.title });
    setConfirmDeleteOpen(true);
  };

  const requestDeleteCriterion = (rubricId: number, criterion: SkillCriterion) => {
    setDeleteTarget({ type: 'criterion', rubricId, criterionId: criterion.id, name: criterion.description });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'rubric') {
        await SkillRubricService.deleteRubric(deleteTarget.rubricId);
        setSuccessMsg(t('dashboard.skills.rubrics.deleteRubricSuccess'));
        setSuccessOpen(true);
        if (expandedRubricId === deleteTarget.rubricId) setExpandedRubricId(null);
        await fetchRubrics();
      } else if (deleteTarget.criterionId !== undefined) {
        await SkillRubricService.deleteCriterion(deleteTarget.rubricId, deleteTarget.criterionId);
        setSuccessMsg(t('dashboard.skills.rubrics.deleteCriterionSuccess'));
        setSuccessOpen(true);
        await fetchCriteria(deleteTarget.rubricId);
      }
    } catch (error) {
      showError(
        error,
        deleteTarget.type === 'rubric'
          ? t('dashboard.skills.rubrics.deleteRubricError')
          : t('dashboard.skills.rubrics.deleteCriterionError'),
      );
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // ---- Grade dropdown auto-adjust ----

  const handleGradeStartChange = (val: number) => {
    setCriterionGradeStart(val);
    if (criterionGradeEnd < val) setCriterionGradeEnd(val);
    setCriterionFormErrors((prev) => ({ ...prev, gradeEnd: undefined, overlap: undefined }));
  };

  const handleGradeEndChange = (val: number) => {
    setCriterionGradeEnd(val);
    setCriterionFormErrors((prev) => ({ ...prev, gradeEnd: undefined, overlap: undefined }));
  };

  // ========================
  // Render helpers
  // ========================

  if (!isOpen || !skill) return null;

  /** Render loading state */
  const renderLoading = () => (
    <div className="dashboard-empty">
      <Loader2 className="dashboard-empty-icon icon-spin" />
      <p className="dashboard-empty-text">{t('dashboard.loadingData')}</p>
    </div>
  );

  /** Render empty rubrics state */
  const renderEmpty = () => (
    <div className="dashboard-empty">
      <p className="dashboard-empty-text">{t('dashboard.skills.rubrics.noRubrics')}</p>
    </div>
  );

  /** Render the inline rubric form (create / edit) */
  const renderRubricForm = () => {
    if (!showRubricForm) return null;
    const label = editingRubric
      ? t('dashboard.skills.rubrics.editRubric')
      : t('dashboard.skills.rubrics.createRubric');

    return (
      <div className="skill-rubrics-form">
        <h4 className="skill-rubrics-form-title">{label}</h4>
        <label className="modal-label">
          {t('dashboard.skills.rubrics.rubricTitle')} <span className="form-required-asterisk">*</span>
        </label>
        <input
          ref={rubricTitleRef}
          type="text"
          className={`modal-input ${rubricFormErrors.title ? 'input-error' : ''}`}
          placeholder={t('dashboard.skills.rubrics.rubricTitlePlaceholder')}
          value={rubricTitle}
          onChange={(e) => { setRubricTitle(e.target.value); setRubricFormErrors({}); }}
          maxLength={200}
          disabled={submittingRubric}
        />
        {rubricFormErrors.title && <p className="form-error-text">{rubricFormErrors.title}</p>}
        <div className="skill-rubrics-form-actions">
          <button className="modal-button cancel" onClick={resetRubricForm} disabled={submittingRubric}>
            {t('common.cancel')}
          </button>
          <button className="modal-button save" onClick={handleRubricSubmit} disabled={submittingRubric}>
            {submittingRubric ? <Loader2 className="icon-spin" size={16} /> : getSubmitLabel(Boolean(editingRubric))}
          </button>
        </div>
      </div>
    );
  };

  /** Render the inline criterion form (create / edit) */
  const renderCriterionForm = (rubricId: number) => {
    if (!showCriterionForm || criterionRubricId !== rubricId) return null;
    const label = editingCriterion
      ? t('dashboard.skills.rubrics.editCriterion')
      : t('dashboard.skills.rubrics.addCriterion');

    return (
      <div className="skill-rubrics-form skill-rubrics-criterion-form">
        <h5 className="skill-rubrics-form-title">{label}</h5>

        {/* Description */}
        <label className="modal-label">
          {t('dashboard.skills.rubrics.criterionDescription')} <span className="form-required-asterisk">*</span>
        </label>
        <textarea
          ref={criterionDescRef}
          className={`modal-input ${criterionFormErrors.description ? 'input-error' : ''}`}
          placeholder={t('dashboard.skills.rubrics.criterionDescriptionPlaceholder')}
          value={criterionDescription}
          onChange={(e) => { setCriterionDescription(e.target.value); setCriterionFormErrors((prev) => ({ ...prev, description: undefined })); }}
          maxLength={200}
          disabled={submittingCriterion}
          rows={2}
          style={{ resize: 'vertical', minHeight: '3rem' }}
        />
        {criterionFormErrors.description && <p className="form-error-text">{criterionFormErrors.description}</p>}

        {/* Grade dropdowns */}
        <div className="skill-rubrics-grade-row">
          <div className="skill-rubrics-grade-field">
            <label className="modal-label">
              {t('dashboard.skills.rubrics.gradeStart')} <span className="form-required-asterisk">*</span>
            </label>
            <select
              className="modal-input skill-rubrics-select"
              value={criterionGradeStart}
              onChange={(e) => handleGradeStartChange(Number(e.target.value))}
              disabled={submittingCriterion}
            >
              {GRADE_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="skill-rubrics-grade-field">
            <label className="modal-label">
              {t('dashboard.skills.rubrics.gradeEnd')} <span className="form-required-asterisk">*</span>
            </label>
            <select
              className={`modal-input skill-rubrics-select ${criterionFormErrors.gradeEnd ? 'input-error' : ''}`}
              value={criterionGradeEnd}
              onChange={(e) => handleGradeEndChange(Number(e.target.value))}
              disabled={submittingCriterion}
            >
              {GRADE_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {criterionFormErrors.gradeEnd && <p className="form-error-text">{criterionFormErrors.gradeEnd}</p>}
          </div>
        </div>
        {criterionFormErrors.overlap && <p className="form-error-text">{criterionFormErrors.overlap}</p>}

        <div className="skill-rubrics-form-actions">
          <button className="modal-button cancel" onClick={resetCriterionForm} disabled={submittingCriterion}>
            {t('common.cancel')}
          </button>
          <button className="modal-button save" onClick={handleCriterionSubmit} disabled={submittingCriterion}>
            {submittingCriterion ? <Loader2 className="icon-spin" size={16} /> : getSubmitLabel(Boolean(editingCriterion))}
          </button>
        </div>
      </div>
    );
  };

  /** Render a single criterion row */
  const renderCriterion = (rubricId: number, criterion: SkillCriterion) => (
    <div key={criterion.id} className="skill-rubrics-criterion">
      <div className="skill-rubrics-criterion-info">
        <span className="skill-rubrics-grade-badge">{criterion.gradeStart} – {criterion.gradeEnd}</span>
        <span className="skill-rubrics-criterion-desc">{criterion.description}</span>
      </div>
      <div className="skill-rubrics-criterion-actions">
        <PortalTooltip text={t('dashboard.skills.rubrics.editCriterion')}>
          <button
            className="school-action-btn edit"
            aria-label={t('dashboard.skills.rubrics.editCriterion')}
            onClick={() => openCriterionEdit(rubricId, criterion)}
          >
            <Edit size={16} />
          </button>
        </PortalTooltip>
        <PortalTooltip text={t('dashboard.skills.rubrics.deleteCriterion')}>
          <button
            className="school-action-btn delete"
            aria-label={t('dashboard.skills.rubrics.deleteCriterion')}
            onClick={() => requestDeleteCriterion(rubricId, criterion)}
          >
            <Trash2 size={16} />
          </button>
        </PortalTooltip>
      </div>
    </div>
  );

  /** Render a single rubric accordion item */
  const renderRubricItem = (rubric: SkillRubric) => {
    const isExpanded = expandedRubricId === rubric.id;
    const criteria = criteriaMap[rubric.id] ?? [];
    const isLoadingThis = loadingCriteria === rubric.id;

    return (
      <div key={rubric.id} className={`skill-rubrics-item ${isExpanded ? 'expanded' : ''}`}>
        {/* Accordion header */}
        <div className="skill-rubrics-accordion-header">
          <button
            className="skill-rubrics-accordion-toggle"
            onClick={() => toggleAccordion(rubric.id)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span className="skill-rubrics-accordion-title">{rubric.title}</span>
            <span className="skill-rubrics-criteria-count">
              ({(rubric.criteria?.length ?? criteria.length)} {t('dashboard.skills.rubrics.criteria')})
            </span>
          </button>
          <div className="skill-rubrics-accordion-actions">
            <PortalTooltip text={t('dashboard.skills.rubrics.editRubric')}>
              <button
                className="school-action-btn edit"
                aria-label={t('dashboard.skills.rubrics.editRubric')}
                onClick={() => openRubricEdit(rubric)}
              >
                <Edit size={16} />
              </button>
            </PortalTooltip>
            <PortalTooltip text={t('dashboard.skills.rubrics.deleteRubric')}>
              <button
                className="school-action-btn delete"
                aria-label={t('dashboard.skills.rubrics.deleteRubric')}
                onClick={() => requestDeleteRubric(rubric)}
              >
                <Trash2 size={16} />
              </button>
            </PortalTooltip>
          </div>
        </div>

        {/* Accordion body */}
        {isExpanded && (
          <div className="skill-rubrics-accordion-body">
            {isLoadingThis ? (
              <div className="skill-rubrics-loading">
                <Loader2 className="icon-spin" size={18} />
              </div>
            ) : (
              <>
                {criteria.length === 0 && (
                  <p className="skill-rubrics-empty-criteria">{t('dashboard.skills.rubrics.noCriteria')}</p>
                )}
                <div className="skill-rubrics-criteria-list">
                  {criteria.map((c) => renderCriterion(rubric.id, c))}
                </div>

                {/* Criterion form (inline under this rubric) */}
                {renderCriterionForm(rubric.id)}

                {/* Add criterion button */}
                {(!showCriterionForm || criterionRubricId !== rubric.id) && (
                  <button
                    className="skill-rubrics-add-criterion-btn"
                    onClick={() => openCriterionCreate(rubric.id)}
                  >
                    <Plus size={14} />
                    {t('dashboard.skills.rubrics.addCriterion')}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ========================
  // Main render
  // ========================

  const deleteConfirmMsg = deleteTarget?.type === 'rubric'
    ? t('dashboard.skills.rubrics.deleteRubricConfirm')
    : t('dashboard.skills.rubrics.deleteCriterionConfirm');

  const deleteTitle = deleteTarget?.type === 'rubric'
    ? t('dashboard.skills.rubrics.deleteRubricTitle')
    : t('dashboard.skills.rubrics.deleteCriterionTitle');

  return (
    <>
      <dialog className="modal-overlay" open={isOpen} aria-label={t('dashboard.skills.rubrics.modalTitle')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="modal-content skill-rubrics-modal-content">
            {/* Header */}
            <div className="skill-rubrics-modal-header">
              <h3 className="modal-title">
                {skill.title}
              </h3>
              <button className="skill-rubrics-close-btn" onClick={onClose} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            {/* Rubric create/edit form */}
            {renderRubricForm()}

            {/* Content */}
            <div className="skill-rubrics-body">
              {loading ? renderLoading() : (
                <>
                  {rubrics.length === 0 && !showRubricForm ? renderEmpty() : (
                    <div className="skill-rubrics-list">
                      {rubrics.map((r) => renderRubricItem(r))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer: add rubric button */}
            {!showRubricForm && (
              <div className="skill-rubrics-modal-footer">
                <button className="dashboard-add-btn" onClick={openRubricCreate}>
                  <Plus size={16} />
                  {t('dashboard.skills.rubrics.createRubric')}
                </button>
              </div>
            )}
          </div>
        </div>
      </dialog>

      {/* Feedback & delete modals */}
      <ErrorModal isOpen={errorOpen} message={errorMsg} onClose={() => setErrorOpen(false)} />
      <SuccessModal isOpen={successOpen} message={successMsg} onClose={() => setSuccessOpen(false)} />
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        itemName={deleteTarget?.name ?? ''}
        title={deleteTitle}
        confirmMessage={deleteConfirmMsg}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmDeleteOpen(false); setDeleteTarget(null); }}
        isDeleting={deleting}
      />
    </>
  );
}

