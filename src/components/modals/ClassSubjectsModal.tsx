import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { SubjectService, Subject } from '../../services/SubjectService';
import { ErrorModal } from './ErrorModal';
import { SuccessModal } from './SuccessModal';

/**
 * Props for ClassSubjectsModal component
 */
interface ClassSubjectsModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** ID of the class to manage subjects for */
  readonly classId: number;
  /** Name of the class for display */
  readonly className: string;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Callback when subjects are changed (assigned or removed) */
  readonly onSubjectsChanged?: () => void;
}

/**
 * Modal component for managing subjects assigned to a class.
 * Allows viewing assigned subjects as badges, removing them,
 * and assigning new subjects via multi-selection checkboxes.
 */
export function ClassSubjectsModal({
  isOpen,
  classId,
  className,
  onClose,
  onSubjectsChanged,
}: ClassSubjectsModalProps) {
  const { t } = useI18n();

  // Data states
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Modal states
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Available subjects (not assigned)
  const availableSubjects = useMemo(() => {
    const assignedIds = new Set(assignedSubjects.map(s => s.id));
    return allSubjects.filter(s => !assignedIds.has(s.id));
  }, [allSubjects, assignedSubjects]);

  // Filtered available subjects based on search
  const filteredAvailableSubjects = useMemo(() => {
    if (!searchTerm.trim()) return availableSubjects;
    const term = searchTerm.toLowerCase();
    return availableSubjects.filter(s => s.name.toLowerCase().includes(term));
  }, [availableSubjects, searchTerm]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && classId) {
      fetchData();
    }
  }, [isOpen, classId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  /**
   * Fetch all subjects and assigned subjects
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [all, assigned] = await Promise.all([
        SubjectService.getSubjects(),
        SubjectService.getSubjectsByClass(classId),
      ]);
      setAllSubjects(all);
      setAssignedSubjects(assigned);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.subjects.loadError'));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle checkbox toggle for a subject
   */
  const handleToggleSubject = (subjectId: number) => {
    setSelectedIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  /**
   * Select all filtered available subjects
   */
  const handleSelectAll = () => {
    const filteredIds = filteredAvailableSubjects.map(s => s.id);
    setSelectedIds(prev => {
      const newIds = new Set([...prev, ...filteredIds]);
      return Array.from(newIds);
    });
  };

  /**
   * Deselect all subjects
   */
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  /**
   * Assign selected subjects to the class
   */
  const handleAssignSelected = async () => {
    if (selectedIds.length === 0) return;

    setAssigning(true);
    try {
      await SubjectService.assignSubjectsToClass(classId, selectedIds);
      setSuccessMessage(t('dashboard.classSubjects.assignSuccess'));
      setSuccessDialogOpen(true);
      setSelectedIds([]);
      await fetchData();
      onSubjectsChanged?.();
    } catch (error) {
      console.error('Error assigning subjects:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.classSubjects.assignError'));
      setErrorDialogOpen(true);
    } finally {
      setAssigning(false);
    }
  };

  /**
   * Remove a subject from the class
   */
  const handleRemoveSubject = async (subjectId: number) => {
    setRemovingId(subjectId);
    try {
      await SubjectService.removeSubjectsFromClass(classId, [subjectId]);
      setSuccessMessage(t('dashboard.classSubjects.removeSuccess'));
      setSuccessDialogOpen(true);
      await fetchData();
      onSubjectsChanged?.();
    } catch (error) {
      console.error('Error removing subject:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.classSubjects.removeError'));
      setErrorDialogOpen(true);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal-overlay" open={isOpen} aria-label={t('dashboard.classSubjects.title')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="modal-content class-subjects-modal-content">
            {/* Header */}
            <h3 className="modal-title">
              {t('dashboard.classSubjects.title')}{className ? `: ${className}` : ''}
            </h3>

            {loading ? (
              <div className="dashboard-empty" style={{ padding: '2rem' }}>
                <Loader2 className="dashboard-empty-icon icon-spin" />
                <p className="dashboard-empty-text">{t('dashboard.loadingData')}</p>
              </div>
            ) : (
              <div className="class-subjects-modal-body">
                {/* Assigned Subjects Section */}
                <div className="class-subjects-section">
                  <h4>{t('dashboard.classSubjects.assignedSubjects')}</h4>
                  <div className="class-subjects-badges">
                    {assignedSubjects.length === 0 ? (
                      <span className="class-subjects-empty" style={{ padding: '0.5rem 0' }}>
                        {t('dashboard.classSubjects.noAssignedSubjects')}
                      </span>
                    ) : (
                      assignedSubjects.map(subject => (
                        <span key={subject.id} className="subject-badge">
                          {subject.name}
                          <button
                            onClick={() => handleRemoveSubject(subject.id)}
                            disabled={removingId === subject.id}
                            aria-label={`${t('common.delete')} ${subject.name}`}
                          >
                            {removingId === subject.id ? (
                              <Loader2 size={14} className="icon-spin" />
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Subjects Section */}
                <div className="class-subjects-section">
                  <h4>{t('dashboard.classSubjects.availableSubjects')}</h4>

                  {/* Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af'
                      }}
                    />
                    <input
                      type="text"
                      className="class-subjects-search"
                      style={{ paddingLeft: '2.25rem' }}
                      placeholder={t('dashboard.classSubjects.searchAvailable')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Select All / Deselect All */}
                  {availableSubjects.length > 0 && (
                    <div className="class-subjects-select-actions">
                      <button
                        type="button"
                        className="class-subjects-select-btn"
                        onClick={handleSelectAll}
                      >
                        {t('dashboard.classSubjects.selectAll')}
                      </button>
                      <button
                        type="button"
                        className="class-subjects-select-btn"
                        onClick={handleDeselectAll}
                        disabled={selectedIds.length === 0}
                      >
                        {t('dashboard.classSubjects.deselectAll')}
                      </button>
                    </div>
                  )}

                  {/* Checkbox List */}
                  {filteredAvailableSubjects.length === 0 ? (
                    <div className="class-subjects-empty">
                      {availableSubjects.length === 0
                        ? t('dashboard.classSubjects.noAvailableSubjects')
                        : t('dashboard.subjects.noResults')}
                    </div>
                  ) : (
                    <div className="subject-checkbox-list">
                      {filteredAvailableSubjects.map(subject => (
                        <label key={subject.id} className="subject-checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(subject.id)}
                            onChange={() => handleToggleSubject(subject.id)}
                          />
                          <span>{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="modal-button cancel"
                onClick={onClose}
                disabled={assigning}
              >
                {t('common.close')}
              </button>
              <button
                type="button"
                className="modal-button save"
                onClick={handleAssignSelected}
                disabled={selectedIds.length === 0 || assigning || loading}
              >
                {assigning ? (
                  <Loader2 size={16} className="icon-spin" />
                ) : (
                  `${t('dashboard.classSubjects.assignSelected')} (${selectedIds.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      </dialog>

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
    </>
  );
}

