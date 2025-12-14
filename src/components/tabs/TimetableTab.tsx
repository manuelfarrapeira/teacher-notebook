import React from 'react';
import {BookOpen} from "lucide-react";

export function TimetableTab()  {
  return (
      <div className="dashboard-card">
        <div className="dashboard-empty">
          <BookOpen className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">No hay clases programadas</p>
        </div>
      </div>
  );
}