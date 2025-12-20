import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Calendar, Settings, LogOut, Clock, Menu } from 'lucide-react';
import { StudentsTab } from './tabs/StudentsTab';
import { ClassesTab } from './tabs/ClassesTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TimetableTab } from './tabs/TimetableTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SchoolService, School } from '../services/SchoolService';
import { LoadingModal } from './modals/LoadingModal';
import { AlertMessage } from './ui/alert';
import { TopBar } from './TopBar';
import { useI18n } from '../lib/i18n';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const schoolData = await SchoolService.getSchools();
      setSchools(schoolData);
      if (schoolData.length > 0) {
        const currentSelectedSchool = selectedSchool ?? schoolData[0].id;
        setSelectedSchool(currentSelectedSchool);
        
        const school = schoolData.find(s => s.id === currentSelectedSchool);
        if (school && school.classes.length > 0) {
          const currentSelectedClass = selectedClass ?? school.classes[0].id;
          setSelectedClass(currentSelectedClass);
        } else {
          setSelectedClass(null);
        }
      } else {
        setErrorMessage(t('dashboard.errors.noSchools'));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(t('dashboard.errors.loadSchoolsError'));
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, selectedClass, t]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const tabs = [
    { id: 'students', label: t('dashboard.tabs.students'), icon: Users },
    { id: 'classes', label: t('dashboard.tabs.classes'), icon: BookOpen },
    { id: 'schedule', label: t('dashboard.tabs.schedule'), icon: Calendar },
    { id: 'timetable', label: t('dashboard.tabs.timetable'), icon: Clock },
    { id: 'settings', label: t('dashboard.tabs.settings'), icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = parseInt(event.target.value, 10);
    setSelectedSchool(schoolId);
    const school = schools.find(s => s.id === schoolId);
    if (school && school.classes.length > 0) {
      setSelectedClass(school.classes[0].id);
    } else {
      setSelectedClass(null);
    }
  };

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(parseInt(event.target.value, 10));
  };

  const handleRefresh = () => {
    fetchSchools();
  };

  const currentSchool = schools.find(s => s.id === selectedSchool);

  return (
    <div className="dashboard-container">
      {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} />}
      
      <nav className={`dashboard-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="dashboard-menu">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} className={`dashboard-tab ${isActive ? 'active' : ''}`} onClick={() => handleTabChange(tab.id)}>
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

      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <button className="menu-button" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        <TopBar
          schools={schools}
          selectedSchool={selectedSchool}
          selectedClass={selectedClass}
          loading={loading}
          currentSchool={currentSchool}
          onSchoolChange={handleSchoolChange}
          onClassChange={handleClassChange}
          onRefresh={handleRefresh}
        />

        <div className="dashboard-tabs-content">
          {activeTab === 'students' && <StudentsTab onAddNew={() => setIsModalOpen(true)} />}
          {activeTab === 'classes' && <ClassesTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'timetable' && ( <TimetableTab />)}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{t('dashboard.addNewItem')}</h3>
            <div className="modal-body">
              <input placeholder="Nombre" className="modal-input" />
              <input placeholder="Email" className="modal-input" />
              <div className="modal-footer">
                <button onClick={() => setIsModalOpen(false)} className="modal-button cancel">{t('common.cancel')}</button>
                <button onClick={() => setIsModalOpen(false)} className="modal-button save">{t('common.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingModal />}
      {errorMessage && <AlertMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
    </div>
  );
}
