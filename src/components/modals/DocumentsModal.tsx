import React, { useState, useRef } from 'react';
import { Loader2, Download, Trash2, Edit, X, Upload } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { ExerciseService, ExerciseDocument } from '../../services/ExerciseService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

/**
 * Props for DocumentsModal
 */
interface DocumentsModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Exercise ID */
  readonly exerciseId: number;
  /** Exercise title for display */
  readonly exerciseTitle: string;
  /** Current documents */
  readonly documents: ExerciseDocument[];
  /** Callback when documents change */
  readonly onDocumentsChanged: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Modal for managing exercise documents (list, upload, download, edit description, delete)
 */
export function DocumentsModal({
  isOpen,
  onClose,
  exerciseId,
  exerciseTitle,
  documents,
  onDocumentsChanged,
}: DocumentsModalProps) {
  const { t } = useI18n();

  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<ExerciseDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage(t('dashboard.rubrics.validation.fileRequired'));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(t('dashboard.rubrics.validation.fileTooLarge'));
      return;
    }

    setUploading(true);
    setErrorMessage('');
    try {
      await ExerciseService.uploadDocument(exerciseId, file, uploadDescription.trim());
      setUploadDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onDocumentsChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.rubrics.uploadDocumentError'));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: ExerciseDocument) => {
    setDownloading(doc.id);
    try {
      const blob = await ExerciseService.downloadDocument(exerciseId, doc.id);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.document;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.rubrics.downloadError'));
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteDoc) return;
    setDeletingId(confirmDeleteDoc.id);
    try {
      await ExerciseService.deleteDocument(exerciseId, confirmDeleteDoc.id);
      onDocumentsChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.rubrics.deleteDocumentError'));
    } finally {
      setDeletingId(null);
      setConfirmDeleteDoc(null);
    }
  };

  const handleStartEdit = (doc: ExerciseDocument) => {
    setEditingId(doc.id);
    setEditDescription(doc.description || '');
  };

  const handleSaveDescription = async (doc: ExerciseDocument) => {
    setSavingDescription(true);
    try {
      await ExerciseService.updateDocumentDescription(exerciseId, doc.id, editDescription.trim());
      setEditingId(null);
      onDocumentsChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.rubrics.updateDescriptionError'));
    } finally {
      setSavingDescription(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal-overlay" open={isOpen} aria-label={t('dashboard.rubrics.documents')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="modal-content" style={{ maxWidth: '36rem', minWidth: '36rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>
                {t('dashboard.rubrics.documents')}: {exerciseTitle}
              </h3>
              <button
                onClick={onClose}
                className="modal-button cancel"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                {errorMessage}
                <button
                  onClick={() => setErrorMessage('')}
                  style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                >
                  âœ•
                </button>
              </div>
            )}

            {/* Documents List */}
            {documents.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                {t('dashboard.rubrics.noDocuments')}
              </p>
            ) : (
              <div className="eval-criteria-doc-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="eval-criteria-doc-item">
                    <div className="eval-criteria-doc-info">
                      <div className="eval-criteria-doc-name" title={doc.document}>{doc.document}</div>
                      {editingId === doc.id ? (
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <input
                            type="text"
                            className="modal-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            disabled={savingDescription}
                          />
                          <button
                            className="modal-button save"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleSaveDescription(doc)}
                            disabled={savingDescription}
                          >
                            {savingDescription ? <Loader2 size={12} className="icon-spin" /> : t('common.save')}
                          </button>
                          <button
                            className="modal-button cancel"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setEditingId(null)}
                            disabled={savingDescription}
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      ) : (
                        Boolean(doc.description) && <div className="eval-criteria-doc-desc">{doc.description}</div>
                      )}
                    </div>
                    <div className="eval-criteria-doc-actions">
                      <button
                        className="eval-criteria-exercise-btn"
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        aria-label={t('dashboard.rubrics.downloadDocument')}
                        title={t('dashboard.rubrics.downloadDocument')}
                      >
                        {downloading === doc.id ? <Loader2 size={16} className="icon-spin" /> : <Download size={16} />}
                      </button>
                      <button
                        className="eval-criteria-exercise-btn"
                        onClick={() => handleStartEdit(doc)}
                        disabled={Boolean(editingId)}
                        aria-label={t('dashboard.rubrics.editDescription')}
                        title={t('dashboard.rubrics.editDescription')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="eval-criteria-exercise-btn delete"
                        onClick={() => setConfirmDeleteDoc(doc)}
                        disabled={deletingId === doc.id}
                        aria-label={t('common.delete')}
                        title={t('common.delete')}
                      >
                        {deletingId === doc.id ? <Loader2 size={16} className="icon-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Form */}
            <div className="eval-criteria-upload-form">
              <label className="filter-label">
                <Upload size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                {t('dashboard.rubrics.uploadDocument')}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="modal-input"
                style={{ padding: '0.5rem' }}
                disabled={uploading}
              />
              <input
                type="text"
                className="modal-input"
                placeholder={t('dashboard.rubrics.documentDescriptionPlaceholder')}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                disabled={uploading}
              />
              <button
                className="modal-button save"
                onClick={handleUpload}
                disabled={uploading}
                style={{ alignSelf: 'flex-end' }}
              >
                {uploading && <Loader2 size={16} className="icon-spin" style={{ marginRight: '0.5rem' }} />}
                {t('dashboard.rubrics.uploadDocument')}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Delete Document Confirm */}
      {confirmDeleteDoc && (
        <ConfirmDeleteModal
          isOpen={Boolean(confirmDeleteDoc)}
          title={t('dashboard.rubrics.deleteDocumentTitle')}
          itemName={confirmDeleteDoc.document}
          confirmMessage={t('dashboard.rubrics.deleteDocumentConfirm')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteDoc(null)}
          isDeleting={deletingId === confirmDeleteDoc.id}
        />
      )}
    </>
  );
}

