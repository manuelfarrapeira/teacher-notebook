import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Calendar, Settings, LogOut, Clock, Menu, RefreshCw } from 'lucide-react';
import { StudentsTab } from './tabs/StudentsTab';
import { ClassesTab } from './tabs/ClassesTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TimetableTab } from './tabs/TimetableTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SchoolService, School } from '../services/SchoolService';
import { LoadingModal } from './modals/LoadingModal';
import { AlertMessage } from './ui/alert'; // Import the new AlertMessage component

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
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
        setErrorMessage("No se encontraron colegios.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error al cargar los colegios. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, selectedClass]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const tabs = [
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'classes', label: 'Clases', icon: BookOpen },
    { id: 'schedule', label: 'Calendario', icon: Calendar },
    { id: 'timetable', label: 'Horario', icon: Clock },
    { id: 'settings', label: 'Configuración', icon: Settings },
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
        <h1 className="dashboard-title">Teacher Notebook</h1>
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
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <button className="menu-button" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        <div className="course-info-selectors">
          <select className="course-select" value={selectedSchool || ''} onChange={handleSchoolChange}>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
          <select className="course-select" value={selectedClass || ''} onChange={handleClassChange}>
            {currentSchool?.classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name} - {cls.schoolYear}</option>
            ))}
          </select>
          <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="dashboard-tabs-content">
          {activeTab === 'students' && <StudentsTab onAddNew={() => setIsModalOpen(true)} />}
          {activeTab === 'classes' && <ClassesTab />}
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
