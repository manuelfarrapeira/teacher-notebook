import React, {useState, useEffect, useRef} from 'react';
import {School} from '../services/SchoolService';
import {UserMenu} from './UserMenu';
import { Menu, ChevronDown } from 'lucide-react';
import { useI18n } from '../lib/i18n';

/** Tipo para un tab de navegación */
export interface TabItem {
    readonly id: string;
    readonly label: string;
    readonly icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface TopBarProps {
    readonly schools: School[];
    readonly selectedSchool: number | null;
    readonly selectedClass: number | null;
    readonly currentSchool: School | undefined;
    readonly userName: string;
    readonly tabs: TabItem[];
    readonly activeTab: string;
    readonly isMenuOpen: boolean;
    readonly onTabChange: (tabId: string) => void;
    readonly onSchoolChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    readonly onClassChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    readonly onLogout: () => void;
    readonly onToggleMenu: () => void;
}

export function TopBar({
    schools,
    selectedSchool,
    selectedClass,
    currentSchool,
    userName,
    tabs,
    activeTab,
    isMenuOpen,
    onTabChange,
    onSchoolChange,
    onClassChange,
    onLogout,
    onToggleMenu,
}: TopBarProps) {
    const { t } = useI18n();
    const [isSchoolOpen, setIsSchoolOpen] = useState(false);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const schoolRef = useRef<HTMLDivElement>(null);
    const classRef = useRef<HTMLDivElement>(null);

    const currentSchoolName = schools.find(s => s.id === selectedSchool)?.name || t('dashboard.students.selectSchool');
    const selectedClassObj = currentSchool?.classes.find(c => c.id === selectedClass);
    const currentClassName = selectedClassObj ? `${selectedClassObj.name} - ${selectedClassObj.schoolYear}` : t('dashboard.students.selectClass');

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
            <div className="top-bar-left">
                <button className="menu-button" onClick={onToggleMenu} aria-label={t('dashboard.sidebar.closeMenu')}>
                    <Menu size={22}/>
                </button>
            </div>

            <nav className="topbar-nav" aria-label="Main navigation">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            className={`topbar-tab ${isActive ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                            title={tab.label}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={tab.label}
                        >
                            <Icon size={20} />
                            <span className="topbar-tab-label">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Dropdown de navegación para móvil */}
            {isMenuOpen && (
                <div className="topbar-nav-dropdown">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`topbar-dropdown-tab ${isActive ? 'active' : ''}`}
                                onClick={() => onTabChange(tab.id)}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="top-bar-right">
                <div className="course-selectors">
                    <div className="selector-button-group" ref={schoolRef}>
                        <button
                            onClick={() => setIsSchoolOpen(!isSchoolOpen)}
                            className="selector-button"
                        >
                            <span className="selector-name">{currentSchoolName}</span>
                            <ChevronDown size={16} className={`chevron-icon ${isSchoolOpen ? 'open' : ''}`}/>
                        </button>
                        {isSchoolOpen && (
                            <div className="selector-dropdown">
                                {schools.map(school => (
                                    <button
                                        key={school.id}
                                        onClick={() => {
                                            const syntheticEvent = {
                                                target: {value: school.id}
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
                            <ChevronDown size={16} className={`chevron-icon ${isClassOpen ? 'open' : ''}`}/>
                        </button>
                        {isClassOpen && (
                            <div className="selector-dropdown">
                                {currentSchool?.classes.map(cls => (
                                    <button
                                        key={cls.id}
                                        onClick={() => {
                                            const syntheticEvent = {
                                                target: {value: cls.id}
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
                <UserMenu userName={userName} onLogout={onLogout}/>
            </div>
        </div>
    );
}
