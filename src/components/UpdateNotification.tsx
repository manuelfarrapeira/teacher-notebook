import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';

/** Possible update statuses received from the main process */
type UpdateStatus = 'checking' | 'downloading' | 'not-available' | 'downloaded' | 'error' | null;

/**
 * Floating notification banner for Squirrel auto-updates.
 * Shows download progress and a restart button when ready.
 */
export function UpdateNotification() {
  const { t } = useI18n();
  const [status, setStatus] = useState<UpdateStatus>(null);
  const [dismissed, setDismissed] = useState(false);
  const [releaseName, setReleaseName] = useState<string>('');

  useEffect(() => {
    if (!globalThis.window?.electronAPI?.onUpdateStatus) return;

    return globalThis.window.electronAPI.onUpdateStatus((newStatus, data) => {
      setStatus(newStatus);
      setDismissed(false);

      if (newStatus === 'downloaded' && data && typeof data === 'object') {
        const payload = data as { releaseName?: string };
        setReleaseName(payload.releaseName || '');
      }
    });
  }, []);

  /** Quit and install the downloaded update */
  const handleInstall = async () => {
    if (globalThis.window?.electronAPI?.installUpdate) {
      await globalThis.window.electronAPI.installUpdate();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed || !status || status === 'checking' || status === 'not-available') {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="update-notification-content">
        {status === 'downloading' && (
          <>
            <Download size={18} className="update-notification-icon" />
            <span className="update-notification-text">
              {t('update.downloading')}
            </span>
            <RefreshCw size={16} className="animate-spin" style={{ marginLeft: '0.5rem' }} />
          </>
        )}

        {status === 'downloaded' && (
          <>
            <CheckCircle size={18} className="update-notification-icon update-success" />
            <span className="update-notification-text">
              {t('update.ready')} {releaseName ? `(${releaseName})` : ''}
            </span>
            <button className="update-notification-btn install" onClick={handleInstall}>
              {t('update.installNow')}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <X size={18} className="update-notification-icon update-error" />
            <span className="update-notification-text">
              {t('update.error')}
            </span>
          </>
        )}

        <button
          className="update-notification-btn dismiss"
          onClick={handleDismiss}
          aria-label={t('common.close')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
