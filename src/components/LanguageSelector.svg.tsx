import React from 'react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';

// Componente de bandera de España (SVG)
const SpainFlag = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="18" rx="2" fill="#AA151B"/>
    <rect y="4.5" width="24" height="9" fill="#F1BF00"/>
    <rect width="24" height="4.5" fill="#AA151B"/>
    <rect y="13.5" width="24" height="4.5" fill="#AA151B"/>
  </svg>
);

// Componente de bandera del Reino Unido (SVG)
const UKFlag = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="18" rx="2" fill="#012169"/>
    <path d="M0 0L24 18M24 0L0 18" stroke="white" strokeWidth="3.6"/>
    <path d="M0 0L24 18M24 0L0 18" stroke="#C8102E" strokeWidth="2.4"/>
    <path d="M12 0V18M0 9H24" stroke="white" strokeWidth="6"/>
    <path d="M12 0V18M0 9H24" stroke="#C8102E" strokeWidth="3.6"/>
  </svg>
);

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  const languageName = locale === 'es' ? 'ES' : 'EN';
  const tooltipText = locale === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2"
      title={tooltipText}
      aria-label={tooltipText}
    >
      <div className="flex items-center justify-center w-6 h-6">
        {locale === 'es' ? <SpainFlag /> : <UKFlag />}
      </div>
      <span className="font-medium text-sm">{languageName}</span>
    </Button>
  );
}

