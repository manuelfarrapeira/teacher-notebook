import React from 'react';
import { BookOpen } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner-container">
          <div className="loading-icon-bg">
            <BookOpen className="loading-icon" />
          </div>
          <div className="loading-spinner"></div>
        </div>
        
        <h2 className="loading-title">Cargando...</h2>
        <p className="loading-subtitle">Preparando tu espacio de trabajo</p>
        
        <div className="loading-progress-container">
        </div>
      </div>
    </div>
  );
}