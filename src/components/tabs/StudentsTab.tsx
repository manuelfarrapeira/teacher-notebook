import React from 'react';
import { Settings } from 'lucide-react';

export function StudentsTab() {
  return (
      <div className="dashboard-card">
          <div className="dashboard-empty">
              <Settings className="dashboard-empty-icon" />
              <p className="dashboard-empty-text">Configuración del sistema</p>
          </div>
      </div>
  );
}

