import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Calendar, Settings, Clock, Building2 } from 'lucide-react';
import { StudentsTab } from './tabs/StudentsTab';
import { ClassesTab } from './tabs/ClassesTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TimetableTab } from './tabs/TimetableTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SchoolsTab } from './tabs/SchoolsTab';
import { TopBar } from './TopBar';
import { SchoolService, School } from '../services/SchoolService';
import { LoadingModal } from './modals/LoadingModal';
import { AlertMessage } from './ui/alert';
import { useI18n } from '../lib/i18n';

interface DashboardProps {
  onLogout: () => void;
  userName: string;
}

export function Dashboard({ onLogout, userName }: Readonly<DashboardProps>) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schools');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error messages

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null); // Clear previous errors
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
  }, [selectedSchool, selectedClass]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const tabs = [
    { id: 'schools', label: t('dashboard.tabs.schools'), icon: Building2 },
    { id: 'classes', label: t('dashboard.tabs.classes'), icon: BookOpen },
    { id: 'students', label: t('dashboard.tabs.students'), icon: Users },
    { id: 'schedule', label: t('dashboard.tabs.schedule'), icon: Calendar },
    { id: 'timetable', label: t('dashboard.tabs.timetable'), icon: Clock },
    { id: 'settings', label: t('dashboard.tabs.settings'), icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = Number.parseInt(event.target.value, 10);
    setSelectedSchool(schoolId);
    const school = schools.find(s => s.id === schoolId);
    if (school && school.classes.length > 0) {
      setSelectedClass(school.classes[0].id);
    } else {
      setSelectedClass(null);
    }
  };

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(Number.parseInt(event.target.value, 10));
  };

  const currentSchool = schools.find(s => s.id === selectedSchool);

  return (
    <div className="dashboard-container">
      {isMenuOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          aria-label={t('dashboard.sidebar.closeMenu')}
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setIsMenuOpen(false);
          }}
        />
      )}

      <nav className={`dashboard-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="dashboard-menu">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`dashboard-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon className="icon-tab" size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <TopBar
            schools={schools}
            selectedSchool={selectedSchool}
            selectedClass={selectedClass}
            currentSchool={currentSchool}
            userName={userName}
            onSchoolChange={handleSchoolChange}
            onClassChange={handleClassChange}
            onLogout={onLogout}
            onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          />
        </header>


        <div className="dashboard-tabs-content">
          {activeTab === 'schools' && <SchoolsTab onSchoolsChange={fetchSchools} />}
          {activeTab === 'classes' && <ClassesTab />}
          {activeTab === 'students' && <StudentsTab/>}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'timetable' && <TimetableTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Añadir Nuevo Elemento</h3>
            <div className="modal-body">
              <input placeholder="Nombre" className="modal-input" />
              <input placeholder="Email" className="modal-input" />
              <div className="modal-footer">
                <button onClick={() => setIsModalOpen(false)} className="modal-button cancel">Cancelar</button>
                <button onClick={() => setIsModalOpen(false)} className="modal-button save">Guardar</button>
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
