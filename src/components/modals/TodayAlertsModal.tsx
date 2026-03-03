import React from 'react';
import { Bell, Calendar, Clock, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { CalendarAlert } from '../../services/CalendarAlertService';

interface TodayAlertsModalProps {
  isOpen: boolean;
  alerts: CalendarAlert[];
  onClose: () => void;
  onGoToCalendar: () => void;
}

export function TodayAlertsModal({ isOpen, alerts, onClose, onGoToCalendar }: Readonly<TodayAlertsModalProps>) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const handleGoToCalendar = () => {
    onClose();
    onGoToCalendar();
  };

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={t('dashboard.calendar.todayAlerts')}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="modal-content today-alerts-modal">
          <div className="today-alerts-header">
            <div className="today-alerts-title-row">
              <Bell size={18} className="today-alerts-bell-icon" />
              <h3 className="modal-title">{t('dashboard.calendar.todayAlerts')}</h3>
            </div>
            <button className="today-alerts-close-btn" onClick={onClose} aria-label={t('common.close')}>
              <X size={18} />
            </button>
          </div>

          <div className="today-alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className="today-alerts-item">
                <div className="today-alerts-item-dot" />
                <div className="today-alerts-item-content">
                  <span className="today-alerts-item-title">{alert.title}</span>
                  {(alert.startTime || alert.endTime) && (
                    <span className="today-alerts-item-time">
                      <Clock size={11} />
                      {alert.startTime ?? ''}
                      {alert.startTime && alert.endTime ? ' – ' : ''}
                      {alert.endTime ?? ''}
                    </span>
                  )}
                  {alert.description && (
                    <span className="today-alerts-item-desc">{alert.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer" style={{ marginTop: '1.25rem', justifyContent: 'space-between' }}>
            <button
              className="modal-button cancel"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              onClick={handleGoToCalendar}
            >
              <Calendar size={14} />
              {t('dashboard.calendar.goToCalendar')}
            </button>
            <button className="modal-button save" onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
