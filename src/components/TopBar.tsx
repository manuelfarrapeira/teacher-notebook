import React, { useState } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { School } from '../services/SchoolService';
import { LanguageSelector } from './LanguageSelector'; // Import the LanguageSelector

interface TopBarProps {
  schools: School[];
  selectedSchool: number | null;
  selectedClass: number | null;
  loading: boolean;
  currentSchool: School | undefined;
  onSchoolChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClassChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
}

export function TopBar({
  schools,
  selectedSchool,
  selectedClass,
  loading,
  currentSchool,
  onSchoolChange,
  onClassChange,
  onRefresh,
}: TopBarProps) {
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);

  const currentSchoolName = schools.find(s => s.id === selectedSchool)?.name || 'Seleccionar escuela';
  const currentClassName = currentSchool?.classes.find(c => c.id === selectedClass)?.name || 'Seleccionar clase';

  return (
    <div className="top-bar-container">
      <div className="course-selectors">
        <div className="selector-button-group">
          <button
            onClick={() => setIsSchoolOpen(!isSchoolOpen)}
            className="selector-button"
          >
            <span className="selector-name">{currentSchoolName}</span>
            <ChevronDown size={16} className={`chevron-icon ${isSchoolOpen ? 'open' : ''}`} />
          </button>
          {isSchoolOpen && (
            <div className="selector-dropdown">
              {schools.map(school => (
                <button
                  key={school.id}
                  onClick={(e) => {
                    const syntheticEvent = {
                      target: { value: school.id }
                    } as unknown as React.ChangeEvent<HTMLSelectElement>;
                    onSchoolChange(syntheticEvent);
                    setIsSchoolOpen(false);
                  }}
                  className="selector-option"
                >
                  {school.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="selector-button-group">
          <button
            onClick={() => setIsClassOpen(!isClassOpen)}
            className="selector-button"
          >
            <span className="selector-name">{currentClassName}</span>
            <ChevronDown size={16} className={`chevron-icon ${isClassOpen ? 'open' : ''}`} />
          </button>
          {isClassOpen && (
            <div className="selector-dropdown">
              {currentSchool?.classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={(e) => {
                    const syntheticEvent = {
                      target: { value: cls.id }
                    } as unknown as React.ChangeEvent<HTMLSelectElement>;
                    onClassChange(syntheticEvent);
                    setIsClassOpen(false);
                  }}
                  className="selector-option"
                >
                  {cls.name} - {cls.schoolYear}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="top-bar-actions">
        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
        <LanguageSelector />
      </div>
    </div>
  );
}
