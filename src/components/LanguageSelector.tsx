import React from 'react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';

// Componente de bandera de España (SVG)
const SpainFlag = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="20" fill="#AA151B"/>
    <rect y="5" width="28" height="10" fill="#F1BF00"/>
  </svg>
);

// Componente de bandera del Reino Unido (SVG)
const UKFlag = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="20" fill="#012169"/>
    <path d="M0 0L28 20M28 0L0 20" stroke="white" strokeWidth="4"/>
    <path d="M0 0L28 20M28 0L0 20" stroke="#C8102E" strokeWidth="2.5"/>
    <path d="M14 0V20M0 10H28" stroke="white" strokeWidth="6.5"/>
    <path d="M14 0V20M0 10H28" stroke="#C8102E" strokeWidth="4"/>
  </svg>
);

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  const tooltipText = locale === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="language-selector-button flex items-center justify-center p-2"
      title={tooltipText}
      aria-label={tooltipText}
    >
      {locale === 'es' ? <SpainFlag /> : <UKFlag />}
    </Button>
  );
}

