import React from 'react';
import { useI18n } from '../../lib/i18n';

interface StudentsTabProps {
  onAddNew: () => void;
}

export function StudentsTab({ onAddNew }: StudentsTabProps) {
  const { t } = useI18n();

  return (
    <div className="dashboard-card">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.students.title')}</h2>
        <button className="dashboard-add-btn" onClick={onAddNew}>
          {t('dashboard.students.addNew')}
        </button>
      </div>
      <div>
        <input className="dashboard-search" placeholder={t('dashboard.students.search')} />
        <div className="dashboard-students">
          {['Ana García', 'Carlos López', 'María Rodríguez'].map((name, index) => (
            <div key={index} className="dashboard-student">
              <div className="dashboard-student-info">
                <div className="dashboard-student-avatar">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="dashboard-student-name">{name}</p>
                  <p className="dashboard-student-grade">{t('dashboard.students.grade')} 10-A</p>
                </div>
              </div>
              <span className="dashboard-badge">{t('dashboard.students.active')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

