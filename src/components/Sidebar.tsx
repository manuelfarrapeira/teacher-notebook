import React from 'react';
import { BookOpen, Users, Calendar, Settings, LogOut, Clock } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface SidebarProps {
  readonly activeTab: string;
  readonly isMenuOpen: boolean;
  readonly onTabChange: (tabId: string) => void;
  readonly onLogout: () => void;
}

export function Sidebar({ activeTab, isMenuOpen, onTabChange, onLogout }: SidebarProps) {
  const { t } = useI18n();

  const tabs = [
    { id: 'students', label: t('dashboard.tabs.students'), icon: Users },
    { id: 'classes', label: t('dashboard.tabs.classes'), icon: BookOpen },
    { id: 'schedule', label: t('dashboard.tabs.schedule'), icon: Calendar },
    { id: 'timetable', label: t('dashboard.tabs.timetable'), icon: Clock },
    { id: 'settings', label: t('dashboard.tabs.settings'), icon: Settings },
  ];

  return (
    <nav className={`dashboard-sidebar ${isMenuOpen ? 'open' : ''}`}>
      <h1 className="dashboard-title">{t('app.title')}</h1>
      <div className="dashboard-menu">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`dashboard-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="icon-tab" size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="dashboard-logout-section">
        <button onClick={onLogout} className="dashboard-tab">
          <LogOut size={20} />
          {t('dashboard.logout')}
        </button>
      </div>
    </nav>
  );
}
