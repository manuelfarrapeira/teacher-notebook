import React, { useState } from 'react';
import { BookOpen, Users, Calendar, Settings, LogOut, ChevronDown, Clock } from 'lucide-react';
import { StudentsTab } from './tabs/StudentsTab';
import { ClassesTab } from './tabs/ClassesTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TimetableTab } from './tabs/TimetableTab';
import { SettingsTab } from './tabs/SettingsTab';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

export function Dashboard({ userName, onLogout }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tabs = [
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'classes', label: 'Clases', icon: BookOpen },
    { id: 'schedule', label: 'Calendario', icon: Calendar },
    { id: 'timetable', label: 'Horario', icon: Clock },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Teacher Notebook {userName && `- ${userName}`}</h1>
            <p className="dashboard-subtitle">Gestiona tus clases y estudiantes de manera eficiente</p>
          </div>
          <button className="dashboard-logout-btn" onClick={onLogout}>
            <LogOut className="icon-logout" />
            Cerrar Sesión
          </button>
        </header>

        <div className="dashboard-stats">
          <div className="dashboard-card">
            <div className="dashboard-card-content">
              <div>
                <h3 className="dashboard-card-title">Total Estudiantes</h3>
                <p className="dashboard-card-number blue">24</p>
              </div>
              <Users className="icon-card blue" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-content">
              <div>
                <h3 className="dashboard-card-title">Clases Hoy</h3>
                <p className="dashboard-card-number green">3</p>
              </div>
              <BookOpen className="icon-card green" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-content">
              <div>
                <h3 className="dashboard-card-title">Próxima Clase</h3>
                <p className="dashboard-card-number orange">14:30</p>
              </div>
              <Calendar className="icon-card orange" />
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="dashboard-tabs-list">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <Icon className="icon-tab" />
                  {tab.label}
                </button>
              );
            })}
            
            {/* Botón desplegable para móvil */}
            <button 
              className="dashboard-tab dashboard-tab-mobile active"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {activeTabData && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <activeTabData.icon className="icon-tab" />
                    {activeTabData.label}
                  </div>
                  <ChevronDown className="icon-tab" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </>
              )}
            </button>
            
            {/* Menú desplegable */}
            <div 
              className="dashboard-tabs-dropdown"
              style={{ display: isDropdownOpen ? 'block' : 'none' }}
            >
              {tabs.filter(tab => tab.id !== activeTab).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button 
                    key={tab.id}
                    className="dashboard-tab"
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <Icon className="icon-tab" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="dashboard-tabs-content">
            {activeTab === 'students' && <StudentsTab onAddNew={() => setIsModalOpen(true)} />}
            {activeTab === 'classes' && <ClassesTab />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'timetable' && (
              <div className="dashboard-card">
                <div className="dashboard-section-header">
                  <div>
                    <h2 className="dashboard-section-title">Horario Semanal</h2>
                  </div>
                </div>
                <TimetableTab />
              </div>
            )}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>

        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '28rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Añadir Nuevo Elemento
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  placeholder="Nombre" 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
                <input 
                  placeholder="Email" 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      background: 'white',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
