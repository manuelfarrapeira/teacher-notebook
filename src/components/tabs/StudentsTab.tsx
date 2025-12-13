import React from 'react';

interface StudentsTabProps {
  onAddNew: () => void;
}

export function StudentsTab({ onAddNew }: StudentsTabProps) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Estudiantes</h2>
        <button className="dashboard-add-btn" onClick={onAddNew}>
          Añadir Nuevo
        </button>
      </div>
      <div>
        <input className="dashboard-search" placeholder="Buscar estudiantes..." />
        <div className="dashboard-students">
          {['Ana García', 'Carlos López', 'María Rodríguez'].map((name, index) => (
            <div key={index} className="dashboard-student">
              <div className="dashboard-student-info">
                <div className="dashboard-student-avatar">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="dashboard-student-name">{name}</p>
                  <p className="dashboard-student-grade">Grado 10-A</p>
                </div>
              </div>
              <span className="dashboard-badge">Activo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}