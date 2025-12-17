import React from 'react';

export function LoadingModal() {
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-spinner-and-text"> {/* New container */}
          <div className="loading-spinner"></div>
          <p className="loading-modal-text">Cargando datos...</p>
        </div>
      </div>
    </div>
  );
}
