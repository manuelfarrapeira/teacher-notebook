import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { School } from '../services/SchoolService';
import { UserMenu } from './UserMenu';

interface TopBarProps {
  schools: School[];
  selectedSchool: number | null;
  selectedClass: number | null;
  loading: boolean;
  currentSchool: School | undefined;
  userName: string;
  onSchoolChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClassChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export function TopBar({
  schools,
  selectedSchool,
  selectedClass,
  loading,
  currentSchool,
  userName,
  onSchoolChange,
  onClassChange,
  onRefresh,
  onLogout,
}: TopBarProps) {
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const schoolRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);

  const currentSchoolName = schools.find(s => s.id === selectedSchool)?.name || 'Seleccionar escuela';
  const selectedClassObj = currentSchool?.classes.find(c => c.id === selectedClass);
  const currentClassName = selectedClassObj ? `${selectedClassObj.name} - ${selectedClassObj.schoolYear}` : 'Seleccionar clase';

  // Handle clicks outside the selectors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (schoolRef.current && !schoolRef.current.contains(event.target as Node)) {
        setIsSchoolOpen(false);
      }
      if (classRef.current && !classRef.current.contains(event.target as Node)) {
        setIsClassOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="top-bar-container">
      <div className="course-selectors">
        <div className="selector-button-group" ref={schoolRef}>
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

        <div className="selector-button-group" ref={classRef}>
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
        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="top-bar-actions">
        <UserMenu userName={userName} onLogout={onLogout} />
      </div>
    </div>
  );
}
