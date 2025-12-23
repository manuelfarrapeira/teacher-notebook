import React from 'react';
import { BookOpen } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

export function ClassesTab() {
  const { t } = useI18n();

  return (
    <div className="dashboard-card">
      <div className="dashboard-empty">
        <BookOpen className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.classes.noClasses')}</p>
      </div>
    </div>
  );
}

