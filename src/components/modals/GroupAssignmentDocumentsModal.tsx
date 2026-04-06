import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Download, Trash2, X, Upload, CheckCircle } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { GroupAssignmentService } from '../../infrastructure/api/GroupAssignmentService';
import type { GroupAssignmentDocument } from '../../domain/models';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PortalTooltip } from '../ui/PortalTooltip';

/**
 * Props for GroupAssignmentDocumentsModal
 */
interface GroupAssignmentDocumentsModalProps {
  /** Whether the modal is open */
  readonly isOpen: boolean;
  /** Callback when modal is closed */
  readonly onClose: () => void;
  /** Assignment ID */
  readonly assignmentId: number;
  /** If provided, documents are at group level; otherwise at assignment level */
  readonly groupId?: number | null;
  /** Display title */
  readonly title: string;
  /** Current documents */
  readonly documents: GroupAssignmentDocument[];
  /** Callback after any document mutation (to refresh parent data) */
  readonly onDocumentsChanged: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Modal for managing group assignment documents (list, upload, download, delete).
 * Supports both assignment-level and group-level documents depending on groupId prop.
 */
export function GroupAssignmentDocumentsModal({
  isOpen,
  onClose,
  assignmentId,
  groupId,
  title,
  documents,
  onDocumentsChanged,
}: GroupAssignmentDocumentsModalProps) {
  const { t } = useI18n();
  /** Shorthand to access groupAssignments i18n keys */
  const gat = (key: string) => t(`dashboard.cooperative.groupAssignments.${key}`);

  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<GroupAssignmentDocument | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Auto-hide success message after 3 seconds */
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /** Upload a document */
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage(gat('validation.fileRequired'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(gat('validation.fileTooLarge'));
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (groupId) {
        await GroupAssignmentService.uploadGroupDoc(assignmentId, groupId, file, uploadDescription.trim());
      } else {
        await GroupAssignmentService.uploadAssignmentDoc(assignmentId, file, uploadDescription.trim());
      }
      setUploadDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccessMessage(gat('uploadSuccess'));
      onDocumentsChanged();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      const isFileSizeError = msg.toLowerCase().includes('maximum upload size') || msg.toLowerCase().includes('size exceed');
      setErrorMessage(isFileSizeError ? gat('validation.fileTooLarge') : (msg || gat('uploadError')));
    } finally {
      setUploading(false);
    }
  };

  /** Download a document */
  const handleDownload = async (doc: GroupAssignmentDocument) => {
    setDownloading(doc.id);
    try {
      const blob = await GroupAssignmentService.downloadDoc(assignmentId, doc.id);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.document;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : gat('downloadError'));
    } finally {
      setDownloading(null);
    }
  };

  /** Confirm and delete a document */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteDoc) return;
    setDeletingId(confirmDeleteDoc.id);
    try {
      await GroupAssignmentService.deleteDoc(assignmentId, confirmDeleteDoc.id);
      onDocumentsChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : gat('deleteDocError'));
    } finally {
      setDeletingId(null);
      setConfirmDeleteDoc(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal-overlay" open={isOpen} aria-label={title}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '50rem', width: '90vw', minWidth: '20rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>{title}</h3>
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
              <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem' }}>
                {errorMessage}
                <button
                  onClick={() => setErrorMessage('')}
                  style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                >
                  ✕
                </button>
              </div>
            )}

            {successMessage && (
              <div style={{ color: '#16a34a', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}

            {/* Documents List */}
            {documents.length === 0 ? (
              <p style={{ color: '#7a8078', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                {gat('noDocuments')}
              </p>
            ) : (
              <div className="eval-criteria-doc-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="eval-criteria-doc-item">
                    <div className="eval-criteria-doc-info">
                      <div className="eval-criteria-doc-name" title={doc.document}>{doc.document}</div>
                      {Boolean(doc.description) && <div className="eval-criteria-doc-desc">{doc.description}</div>}
                    </div>
                    <div className="eval-criteria-doc-actions">
                      <PortalTooltip text={gat('downloadDocument')} as="span">
                        <button
                          className="eval-criteria-exercise-btn"
                          onClick={() => handleDownload(doc)}
                          disabled={downloading === doc.id}
                          aria-label={gat('downloadDocument')}
                        >
                          {downloading === doc.id ? <Loader2 size={16} className="icon-spin" /> : <Download size={16} />}
                        </button>
                      </PortalTooltip>
                      <PortalTooltip text={t('common.delete')} as="span">
                        <button
                          className="eval-criteria-exercise-btn delete"
                          onClick={() => setConfirmDeleteDoc(doc)}
                          disabled={deletingId === doc.id}
                          aria-label={t('common.delete')}
                        >
                          {deletingId === doc.id ? <Loader2 size={16} className="icon-spin" /> : <Trash2 size={16} />}
                        </button>
                      </PortalTooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Form */}
            <div className="eval-criteria-upload-form">
              <label className="filter-label">
                <Upload size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                {gat('uploadDocument')}
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
                placeholder={t('dashboard.evalCriteria.documentDescriptionPlaceholder')}
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
                {gat('uploadDocument')}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Delete Document Confirm */}
      {confirmDeleteDoc && (
        <ConfirmDeleteModal
          isOpen={Boolean(confirmDeleteDoc)}
          title={gat('deleteDocumentTitle')}
          itemName={confirmDeleteDoc.document}
          confirmMessage={gat('deleteDocumentConfirm')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteDoc(null)}
          isDeleting={deletingId === confirmDeleteDoc.id}
        />
      )}
    </>
  );
}

