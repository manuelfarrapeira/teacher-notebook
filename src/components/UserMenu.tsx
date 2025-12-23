import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut } from 'lucide-react';
import { LanguageSelector } from './selectors/LanguageSelector';
import { useI18n } from '../lib/i18n';

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
}

export function UserMenu({ userName, onLogout }: Readonly<UserMenuProps>) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        className="user-menu-button"
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div
          className="user-menu-dropdown"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="user-menu-header">
            <User size={16} />
            <span className="user-menu-name">{userName}</span>
          </div>

          <div className="user-menu-divider" />

          <div className="user-menu-item">
            <LanguageSelector />
          </div>

          <div className="user-menu-divider" />

          <button className="user-menu-logout" onClick={onLogout}>
            <LogOut size={16} />
            {t('dashboard.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

