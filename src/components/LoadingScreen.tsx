import React from 'react';
import { BookOpen } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export function LoadingScreen() {
  const { t } = useI18n();

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner-container">
          <div className="loading-icon-bg">
            <BookOpen className="loading-icon" />
          </div>
          <div className="loading-spinner"></div>
        </div>
        
        <h2 className="loading-title">{t('loading.title')}</h2>
        <p className="loading-subtitle">{t('loading.subtitle')}</p>

        <div className="loading-progress-container">
        </div>
      </div>
    </div>
  );
}