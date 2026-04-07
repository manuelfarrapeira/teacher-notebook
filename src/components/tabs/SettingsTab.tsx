import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

/** Possible states for the manual update check */
type CheckState = 'idle' | 'checking' | 'up-to-date' | 'available' | 'error';

/**
 * Settings tab — shows app version, language selector, and manual update check.
 */
export function SettingsTab() {
  const { t } = useI18n();
  const [appVersion, setAppVersion] = useState<string>('');
  const [checkState, setCheckState] = useState<CheckState>('idle');

  useEffect(() => {
    if (globalThis.window?.electronAPI?.getAppVersion) {
      globalThis.window.electronAPI.getAppVersion().then(setAppVersion).catch(() => { /* ignore */ });
    }

    if (globalThis.window?.electronAPI?.onUpdateStatus) {
      return globalThis.window.electronAPI.onUpdateStatus((updateStatus) => {
        if (updateStatus === 'not-available') setCheckState('up-to-date');
        else if (updateStatus === 'downloaded') setCheckState('available');
        else if (updateStatus === 'error') setCheckState('error');
      });
    }
  }, []);

  /** Trigger a manual update check */
  const handleCheckForUpdates = async () => {
    setCheckState('checking');

    // Safety timeout — if no response in 15s, show up-to-date
    const timeout = setTimeout(() => {
      setCheckState((prev) => prev === 'checking' ? 'up-to-date' : prev);
    }, 15_000);

    if (globalThis.window?.electronAPI?.checkForUpdates) {
      const result = await globalThis.window.electronAPI.checkForUpdates();
      if (result.status === 'dev-mode' || result.status === 'not-pro' || result.status === 'up-to-date') {
        clearTimeout(timeout);
        setCheckState('up-to-date');
      } else if (result.status === 'error') {
        clearTimeout(timeout);
        setCheckState('error');
      }
      // 'checking' status — wait for onUpdateStatus listener or timeout
    } else {
      clearTimeout(timeout);
      setCheckState('error');
    }
  };

  /**
   * Renders status feedback after a manual update check.
   */
  function renderCheckStatus() {
    switch (checkState) {
      case 'checking':
        return (
          <span className="settings-update-status">
            <RefreshCw size={14} className="animate-spin" />
          </span>
        );
      case 'up-to-date':
        return (
          <span className="settings-update-status settings-up-to-date">
            <CheckCircle size={14} />
            {t('update.upToDate')}
          </span>
        );
      case 'available':
        return (
          <span className="settings-update-status settings-update-available">
            <AlertCircle size={14} />
            {t('update.ready')}
          </span>
        );
      case 'error':
        return (
          <span className="settings-update-status settings-update-error">
            <AlertCircle size={14} />
            {t('update.error')}
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">
          <Settings size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          {t('dashboard.tabs.settings')}
        </h2>
      </div>

      <div className="settings-section">
        {/* Version and update check */}
        <div className="settings-row">
          <span className="settings-label">{t('update.version')}</span>
          <span className="settings-value">{appVersion || '—'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">{t('update.checkManually')}</span>
          <div className="settings-value" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="dashboard-add-btn"
              onClick={handleCheckForUpdates}
              disabled={checkState === 'checking'}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
            >
              <RefreshCw size={14} />
              {t('update.checkManually')}
            </button>
            {renderCheckStatus()}
          </div>
        </div>
      </div>
    </div>
  );
}
