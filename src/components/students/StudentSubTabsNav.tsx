import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { useIsMobile } from '../../lib/utils';

/** Available sub-tab keys for the students section */
export type StudentSubTab = 'class' | 'evalCriteria' | 'classRubrics' | 'attendance' | 'cooperative' | 'all';

interface StudentSubTabsNavProps {
  /** Currently active sub-tab */
  activeSubTab: StudentSubTab;
  /** Callback when a sub-tab is selected */
  onSubTabChange: (tab: StudentSubTab) => void;
}

/** Ordered list of sub-tab definitions */
const SUB_TABS: { key: StudentSubTab; labelKey: string }[] = [
  { key: 'class', labelKey: 'dashboard.students.classStudents' },
  { key: 'evalCriteria', labelKey: 'dashboard.evalCriteria.title' },
  { key: 'classRubrics', labelKey: 'dashboard.classRubrics.title' },
  { key: 'cooperative', labelKey: 'dashboard.cooperative.title' },
  { key: 'attendance', labelKey: 'dashboard.attendance.title' },
  { key: 'all', labelKey: 'dashboard.students.allStudents' },
];

/**
 * Sub-tab navigation for the Students section.
 * Renders a dropdown on mobile and horizontal tabs on desktop.
 */
export function StudentSubTabsNav({ activeSubTab, onSubTabChange }: Readonly<StudentSubTabsNavProps>) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Get the translated label for the active sub-tab */
  const activeLabel = SUB_TABS.find(tab => tab.key === activeSubTab)?.labelKey ?? '';

  const handleSelect = (tab: StudentSubTab) => {
    onSubTabChange(tab);
    setIsDropdownOpen(false);
  };

  if (isMobile) {
    return (
      <div className="student-tabs-dropdown" ref={dropdownRef}>
        <button
          className="student-tabs-dropdown-trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>{t(activeLabel)}</span>
          <ChevronDown size={16} className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="student-tabs-dropdown-menu">
            {SUB_TABS.map(tab => (
              <button
                key={tab.key}
                className={`student-tabs-dropdown-option ${activeSubTab === tab.key ? 'active' : ''}`}
                onClick={() => handleSelect(tab.key)}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="student-tabs">
      {SUB_TABS.map(tab => (
        <button
          key={tab.key}
          className={activeSubTab === tab.key ? 'active' : ''}
          onClick={() => onSubTabChange(tab.key)}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
}

