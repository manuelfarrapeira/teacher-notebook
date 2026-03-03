import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, X, Bell } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { CalendarAlertService, CalendarAlert } from '../../services/CalendarAlertService';
import { ApiErrorException } from '../../services/BaseService';
import { CalendarAlertFormModal } from '../modals/CalendarAlertFormModal';
import { ErrorModal } from '../modals/ErrorModal';

const MAX_VISIBLE_EVENTS = 3;

function buildCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(start.getDate() - startOffset);

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  let keepGoing = true;

  while (keepGoing) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month || cursor.getFullYear() !== year) {
      keepGoing = false;
    }
  }

  return weeks;
}

function formatDayKey(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiErrorException) {
    return error.apiError.detail ?? error.apiError.description;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function isAlertExpired(alert: CalendarAlert): boolean {
  const now = new Date();
  const nowDate = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [d, m, y] = alert.date.split('/');
  const alertDate = `${y}-${m}-${d}`;

  if (alertDate > nowDate) return false;

  if (alertDate < nowDate) return true;

  if (alert.endTime) return alert.endTime <= nowTime;
  if (alert.startTime) return alert.startTime <= nowTime;
  return false;
}

interface PopupState {
  day: Date;
  dayAlerts: CalendarAlert[];
  top: number;
  left: number;
}

interface DayAlertsPopupProps {
  popupState: PopupState;
  onClose: () => void;
  onBadgeClick: (e: React.MouseEvent, alert: CalendarAlert) => void;
  intlLocale: string;
}

function DayAlertsPopup({ popupState, onClose, onBadgeClick, intlLocale }: Readonly<DayAlertsPopupProps>) {
  const popupRef = useRef<HTMLElement>(null);
  const { day, dayAlerts, top, left } = popupState;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const dateLabel = new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(day);

  const popup = (
    <section
      className="calendar-day-popup"
      ref={popupRef}
      style={{ position: 'fixed', top, left, zIndex: 1000 }}
      aria-label={dateLabel}
    >
      <div className="calendar-day-popup-header">
        <span className="calendar-day-popup-title">{dateLabel}</span>
        <button className="calendar-day-popup-close" onClick={onClose} aria-label="Cerrar">
          <X size={14} />
        </button>
      </div>
      <div className="calendar-day-popup-list">
        {dayAlerts.map(alert => {
          const expired = isAlertExpired(alert);
          const todayAlert = isToday(day) && !expired;
          const itemClass = [
            'calendar-day-popup-item',
            expired ? 'expired' : '',
            todayAlert ? 'current-day' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={alert.id}
              className={itemClass}
              onClick={e => { onBadgeClick(e, alert); onClose(); }}
            >
              {alert.startTime && (
                <span className="calendar-day-popup-time">{alert.startTime}</span>
              )}
              <span className="calendar-day-popup-name">{alert.title}</span>
              {todayAlert && <Bell size={11} className="calendar-day-popup-bell" />}
            </button>
          );
        })}
      </div>
    </section>
  );

  return ReactDOM.createPortal(popup, document.body);
}

interface CalendarCellProps {
  day: Date;
  currentMonth: number;
  dayAlerts: CalendarAlert[];
  onCellClick: (date: Date) => void;
  onDayNumberClick: (e: React.MouseEvent, date: Date) => void;
  onBadgeClick: (e: React.MouseEvent, alert: CalendarAlert) => void;
  onMoreClick: (e: React.MouseEvent, day: Date, dayAlerts: CalendarAlert[]) => void;
  moreEventsLabel: (n: number) => string;
}

function CalendarCell({ day, currentMonth, dayAlerts, onCellClick, onDayNumberClick, onBadgeClick, onMoreClick, moreEventsLabel }: Readonly<CalendarCellProps>) {
  const visibleAlerts = dayAlerts.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = dayAlerts.length - visibleAlerts.length;
  const isOtherMonth = day.getMonth() !== currentMonth;
  const isTodayCell = isToday(day);

  const cellClasses = [
    'calendar-cell',
    isOtherMonth ? 'other-month' : '',
    isTodayCell ? 'today' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      onClick={() => onCellClick(day)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onCellClick(day); }}
      aria-label={`Añadir alerta el ${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}`}
    >
      <button
        className="calendar-day-number"
        onClick={e => onDayNumberClick(e, day)}
        title={`Añadir alerta el ${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}`}
      >
        {day.getDate()}
      </button>
      <div className="calendar-events">
        {visibleAlerts.map(alert => {
          const expired = isAlertExpired(alert);
          const todayAlert = isTodayCell && !expired;
          const badgeClass = [
            'calendar-event-badge',
            expired ? 'expired' : '',
            todayAlert ? 'current-day' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={alert.id}
              className={badgeClass}
              onClick={e => onBadgeClick(e, alert)}
              title={alert.title}
            >
              <span className="calendar-event-badge-text">
                {alert.startTime ? `${alert.startTime} ` : ''}{alert.title}
              </span>
              {todayAlert && <Bell size={10} className="calendar-event-badge-icon" />}
            </button>
          );
        })}
        {hiddenCount > 0 && (
          <button
            className="calendar-more-indicator"
            onClick={e => onMoreClick(e, day, dayAlerts)}
          >
            {moreEventsLabel(hiddenCount)}
          </button>
        )}
      </div>
    </div>
  );
}

export function ScheduleTab() {
  const { t, locale } = useI18n();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [alerts, setAlerts] = useState<CalendarAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [alertToEdit, setAlertToEdit] = useState<CalendarAlert | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [popupState, setPopupState] = useState<PopupState | null>(null);

  const fetchAlerts = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await CalendarAlertService.getByMonthYear(year, month + 1);
      setAlerts(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('dashboard.calendar.loadError')));
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAlerts(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchAlerts]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleCellClick = (date: Date) => {
    setPopupState(null);
    setSelectedDate(date);
    setAlertToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleNewAlert = () => {
    setPopupState(null);
    setSelectedDate(new Date());
    setAlertToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleBadgeClick = (e: React.MouseEvent, alert: CalendarAlert) => {
    e.stopPropagation();
    setPopupState(null);
    setAlertToEdit(alert);
    setSelectedDate(null);
    setIsFormModalOpen(true);
  };

  const handleDayNumberClick = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();
    setPopupState(null);
    setSelectedDate(date);
    setAlertToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleMoreClick = (e: React.MouseEvent, day: Date, dayAlerts: CalendarAlert[]) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popupWidth = 260;
    const left = rect.right + popupWidth > window.innerWidth
      ? rect.left - popupWidth
      : rect.right;
    setPopupState({ day, dayAlerts, top: rect.top, left });
  };

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setAlertToEdit(null);
    setSelectedDate(null);
  };

  const handleSaved = () => {
    fetchAlerts(currentYear, currentMonth);
  };

  const handleDeleted = () => {
    fetchAlerts(currentYear, currentMonth);
  };

  const weeks = buildCalendarGrid(currentYear, currentMonth);
  const intlLocale = locale === 'es' ? 'es-ES' : 'en-US';

  const dayHeaders = useMemo(() => {
    const baseMonday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);
      return new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(d);
    });
  }, [intlLocale]);

  const alertsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarAlert[]>();
    for (const alert of alerts) {
      const existing = map.get(alert.date) ?? [];
      map.set(alert.date, [...existing, alert]);
    }
    map.forEach((dayAlerts, key) => {
      map.set(key, [...dayAlerts].sort((a, b) => {
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        return 0;
      }));
    });
    return map;
  }, [alerts]);

  return (
    <div className="dashboard-card">
      <div className="calendar-container">

        <div className="calendar-header">
          <div className="calendar-header-nav">
            <button className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="Mes anterior">
              <ChevronLeft size={18} />
            </button>
            <button className="calendar-nav-btn" onClick={goToNextMonth} aria-label="Mes siguiente">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-header-selectors">
            <select
              className="calendar-month-select"
              value={currentMonth}
              onChange={e => setCurrentMonth(Number(e.target.value))}
              aria-label="Seleccionar mes"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Intl.DateTimeFormat(intlLocale, { month: 'long' }).format(new Date(2024, i, 1))}
                </option>
              ))}
            </select>
            <select
              className="calendar-year-select"
              value={currentYear}
              onChange={e => setCurrentYear(Number(e.target.value))}
              aria-label="Seleccionar año"
            >
              {Array.from({ length: 21 }, (_, i) => {
                const y = today.getFullYear() - 10 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>

          <div className="calendar-header-actions">
            {loading && <Loader2 size={18} className="icon-spin" style={{ color: '#624db6' }} />}
            <button className="dashboard-add-btn" onClick={handleNewAlert}>
              {t('dashboard.calendar.newAlert')}
            </button>
          </div>
        </div>

        <div className="calendar-grid-wrapper">
          <div className="calendar-day-headers">
            {dayHeaders.map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {weeks.map(week =>
              week.map(day => {
                const key = formatDayKey(day);
                const dayAlerts = alertsByDay.get(key) ?? [];
                return (
                  <CalendarCell
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    day={day}
                    currentMonth={currentMonth}
                    dayAlerts={dayAlerts}
                    onCellClick={handleCellClick}
                    onDayNumberClick={handleDayNumberClick}
                    onBadgeClick={handleBadgeClick}
                    onMoreClick={handleMoreClick}
                    moreEventsLabel={n => t('dashboard.calendar.moreEvents').replace('{n}', String(n))}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {popupState && (
        <DayAlertsPopup
          popupState={popupState}
          onClose={() => setPopupState(null)}
          onBadgeClick={handleBadgeClick}
          intlLocale={intlLocale}
        />
      )}

      <CalendarAlertFormModal
        isOpen={isFormModalOpen}
        alertToEdit={alertToEdit}
        selectedDate={selectedDate}
        onClose={handleModalClose}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      <ErrorModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
}
