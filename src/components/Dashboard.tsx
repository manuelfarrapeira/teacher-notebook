import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Calendar, Settings, Clock, Building2, BookType } from 'lucide-react';
import { StudentsTab } from './tabs/StudentsTab';
import { ClassesTab } from './tabs/ClassesTab';
import { SubjectsTab } from './tabs/SubjectsTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TimetableTab } from './tabs/TimetableTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SchoolsTab } from './tabs/SchoolsTab';
import { TopBar } from './TopBar';
import type { TabItem } from './TopBar';
import { SchoolService, School } from '../services/SchoolService';
import { CalendarAlertService, CalendarAlert } from '../services/CalendarAlertService';
import { LoadingModal } from './modals/LoadingModal';
import { AlertMessage } from './ui/alert';
import { TodayAlertsModal } from './modals/TodayAlertsModal';
import { useI18n } from '../lib/i18n';
import { StudentPhotoProvider } from '../contexts/StudentPhotoContext';

function getTodayKey(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

function isAlertActiveToday(alert: CalendarAlert): boolean {
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (alert.endTime) return alert.endTime > nowTime;
  if (alert.startTime) return alert.startTime > nowTime;
  return true;
}


interface DashboardProps {
  onLogout: () => void;
  userName: string;
}

export function Dashboard({ onLogout, userName }: Readonly<DashboardProps>) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCurrentAlerts, setHasCurrentAlerts] = useState(false);
  const [todayAlertsList, setTodayAlertsList] = useState<CalendarAlert[]>([]);
  const [showTodayAlertsModal, setShowTodayAlertsModal] = useState(false);

  const checkTodayAlerts = useCallback(async () => {
    try {
      const now = new Date();
      const data = await CalendarAlertService.getByMonthYear(now.getFullYear(), now.getMonth() + 1);
      const todayKey = getTodayKey();
      const todayAlerts = data.filter(a => a.date === todayKey);
      const activeAlerts = todayAlerts.filter(isAlertActiveToday);
      setHasCurrentAlerts(activeAlerts.length > 0);
      setTodayAlertsList(activeAlerts);
    } catch {
    }
  }, []);

  const hasCheckedOnMount = React.useRef(false);

  useEffect(() => {
    const run = async () => {
      await checkTodayAlerts();
      if (!hasCheckedOnMount.current) {
        hasCheckedOnMount.current = true;
        setShowTodayAlertsModal(true);
      }
    };
    run();
    const interval = setInterval(checkTodayAlerts, 60000);
    return () => clearInterval(interval);
  }, [checkTodayAlerts]);

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
  }, [selectedSchool, selectedClass]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const tabs: TabItem[] = [
    { id: 'students', label: t('dashboard.tabs.students'), icon: Users },
    { id: 'schools', label: t('dashboard.tabs.schools'), icon: Building2 },
    { id: 'classes', label: t('dashboard.tabs.classes'), icon: BookOpen },
    { id: 'subjects', label: t('dashboard.tabs.subjects'), icon: BookType },
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
    <StudentPhotoProvider>
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

        <header className="dashboard-header">
          <TopBar
            schools={schools}
            selectedSchool={selectedSchool}
            selectedClass={selectedClass}
            currentSchool={currentSchool}
            userName={userName}
            tabs={tabs}
            activeTab={activeTab}
            isMenuOpen={isMenuOpen}
            hasCurrentAlerts={hasCurrentAlerts}
            onTabChange={handleTabChange}
            onSchoolChange={handleSchoolChange}
            onClassChange={handleClassChange}
            onLogout={onLogout}
            onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          />
        </header>

        <main className="dashboard-main-content">


          <div className="dashboard-tabs-content">
            {activeTab === 'schools' && <SchoolsTab onSchoolsChange={fetchSchools} />}
            {activeTab === 'classes' && <ClassesTab onClassesChange={fetchSchools} />}
            {activeTab === 'subjects' && <SubjectsTab />}
            {activeTab === 'students' && (
              <StudentsTab
                selectedSchool={selectedSchool}
                selectedClass={selectedClass}
                schools={schools}
                onRefreshSchools={fetchSchools}
              />
            )}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'timetable' && (
              <TimetableTab selectedClass={selectedClass} />
            )}
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

        <TodayAlertsModal
          isOpen={showTodayAlertsModal && todayAlertsList.length > 0}
          alerts={todayAlertsList}
          onClose={() => setShowTodayAlertsModal(false)}
          onGoToCalendar={() => setActiveTab('schedule')}
        />

        {loading && <LoadingModal />}
        {errorMessage && <AlertMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
      </div>
    </StudentPhotoProvider>
  );
}
