import React, { useState } from 'react';
import { BookOpen, Users, Calendar, Settings, LogOut, Clock, Menu } from 'lucide-react';
import { StudentsTab } from './tabs/StudentsTab';
import { ClassesTab } from './tabs/ClassesTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TimetableTab } from './tabs/TimetableTab';
import { SettingsTab } from './tabs/SettingsTab';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'classes', label: 'Clases', icon: BookOpen },
    { id: 'schedule', label: 'Calendario', icon: Calendar },
    { id: 'timetable', label: 'Horario', icon: Clock },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false); // Close menu on tab change
  };

  return (
    <div className="dashboard-container">
      {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} />}
      
      {/* Sidebar */}
      <nav className={`dashboard-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <h1 className="dashboard-title">
          Teacher Notebook
        </h1>

        <div className="dashboard-menu">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`dashboard-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <Icon className="icon-tab" size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="dashboard-logout-section">
          <button
            onClick={onLogout}
            className="dashboard-tab"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <button className="menu-button" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        <div className="course-info">
          Colegio publico Tui - curso 24/25 cuarto
        </div>

        <div className="dashboard-tabs-content">
          {activeTab === 'students' && <StudentsTab onAddNew={() => setIsModalOpen(true)} />}
          {activeTab === 'classes' && <ClassesTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'timetable' && (<TimetableTab />)}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              Añadir Nuevo Elemento
            </h3>
            <div className="modal-body">
              <input
                placeholder="Nombre"
                className="modal-input"
              />
              <input
                placeholder="Email"
                className="modal-input"
              />
              <div className="modal-footer">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="modal-button cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="modal-button save"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
