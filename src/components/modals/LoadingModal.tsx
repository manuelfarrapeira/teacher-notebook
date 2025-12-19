import React from 'react';
import { useI18n } from '../../lib/i18n';

export function LoadingModal() {
  const { t } = useI18n();

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-spinner-and-text">
          <div className="loading-spinner"></div>
          <p className="loading-modal-text">{t('dashboard.loadingData')}</p>
        </div>
      </div>
    </div>
  );
}
