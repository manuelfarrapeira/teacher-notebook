import { RefreshCw } from 'lucide-react';
import React from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, loading }) => (
  <button className="refresh-button" onClick={onClick} disabled={loading}>
    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
  </button>
);

