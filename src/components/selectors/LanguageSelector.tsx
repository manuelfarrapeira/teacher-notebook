import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../lib/i18n';
import { ChevronDown } from 'lucide-react';

const SpainFlag = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '3px' }}>
    <rect width="24" height="18" fill="#AA151B"/>
    <rect y="4.5" width="24" height="9" fill="#F1BF00"/>
  </svg>
);

const UKFlag = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '3px' }}>
    <rect width="24" height="18" fill="#012169"/>
    <path d="M0 0L24 18M24 0L0 18" stroke="white" strokeWidth="3.6"/>
    <path d="M0 0L24 18M24 0L0 18" stroke="#C8102E" strokeWidth="2.25"/>
    <path d="M12 0V18M0 9H24" stroke="white" strokeWidth="5.85"/>
    <path d="M12 0V18M0 9H24" stroke="#C8102E" strokeWidth="3.6"/>
  </svg>
);

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLocale: 'es' | 'en') => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  // Handle clicks outside the language selector
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obtener el schoolYear actual si está disponible
  let schoolYear = '';
  if (typeof window !== 'undefined') {
    // Intentar obtener schoolYear de la URL, contexto global, o variable global
    // Aquí puedes ajustar la lógica según cómo se obtiene schoolYear en tu app
    const urlParams = new URLSearchParams(window.location.search);
    schoolYear = urlParams.get('schoolYear') || '';
  }

  // Concatenar el nombre del idioma con el schoolYear
  const languageName = `${locale === 'es' ? t('common.language.es') : t('common.language.en')}${schoolYear ? ' - ' + schoolYear : ''}`;

  return (
    <div className="language-selector-container" ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="language-button">
        {locale === 'es' ? <SpainFlag /> : <UKFlag />}
        <span className="language-name">{languageName}</span>
        <ChevronDown size={16} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="language-dropdown">
          <button onClick={() => handleLanguageChange('es')} className="language-option">
            <SpainFlag />
            <span>{`${t('common.language.es')}${schoolYear ? ' - ' + schoolYear : ''}`}</span>
          </button>
          <button onClick={() => handleLanguageChange('en')} className="language-option">
            <UKFlag />
            <span>{`${t('common.language.en')}${schoolYear ? ' - ' + schoolYear : ''}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
