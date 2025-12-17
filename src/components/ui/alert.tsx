import React from 'react';
import { XCircle } from 'lucide-react';

interface AlertMessageProps {
  message: string;
  onClose: () => void;
}

export function AlertMessage({ message, onClose }: AlertMessageProps) {
  return (
    <div className="alert-message-container">
      <div className="alert-message-content">
        <XCircle size={24} className="alert-icon" />
        <p className="alert-text">{message}</p>
        <button onClick={onClose} className="alert-close-button">
          &times;
        </button>
      </div>
    </div>
  );
}
