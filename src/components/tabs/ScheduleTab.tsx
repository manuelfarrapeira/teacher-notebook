import React from 'react';
import { Calendar } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

/**
 * ScheduleTab component - Calendar view (placeholder)
 */
export function ScheduleTab() {
  const { t } = useI18n();

  return (
    <div className="dashboard-card">
      <div className="dashboard-empty">
        <Calendar className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.tabs.schedule')}</p>
      </div>
    </div>
  );
}

