import React from 'react';
import { RefreshCw } from 'lucide-react';
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
  return (
    <div className="top-bar-container">
      <div className="course-selectors">
        <select className="course-select" value={selectedSchool || ''} onChange={onSchoolChange}>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
        <select className="course-select" value={selectedClass || ''} onChange={onClassChange}>
          {currentSchool?.classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name} - {cls.schoolYear}</option>
          ))}
        </select>
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
