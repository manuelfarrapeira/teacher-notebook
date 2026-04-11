import React from 'react';
import { Users, Loader2, UserMinus, Edit, Search, Grid3x3, List, Cake, ClipboardList, CalendarDays, Award } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import type { Student } from '../../domain/models';
import { isBirthday } from '../../lib/utils';
import { StudentPhoto } from './StudentPhoto';
import { ShapeBadge } from './ShapeBadge';

interface ClassStudentsListProps {
  /** The currently selected class ID */
  selectedClass: number | null;
  /** Students belonging to the selected class (already filtered) */
  classStudents: Student[];
  /** Students not in the class matching the search term */
  unassignedStudents: Student[];
  /** Whether data is loading */
  loading: boolean;
  /** Search term for quick-add */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchTermChange: (value: string) => void;
  /** Filter value for class students */
  filterValue: string;
  /** Callback when filter value changes */
  onFilterChange: (value: string) => void;
  /** Current view mode */
  viewMode: 'grid' | 'list';
  /** Effective view mode (may differ on mobile) */
  effectiveViewMode: 'grid' | 'list';
  /** Whether the device is mobile */
  isMobile: boolean;
  /** Whether a class operation is in progress */
  operationInProgress: boolean;
  /** Callbacks */
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onEditStudent: (student: Student) => void;
  onQuickAssign: (student: Student) => void;
  onRemoveFromClass: (student: Student, classId: number) => void;
  onShowGrades: (student: Student) => void;
  onShowAbsences: (student: Student) => void;
  onShowRubricCriteria: (student: Student) => void;
}

/**
 * Renders the class students list with search bars, view toggle, and student cards
 */
export function ClassStudentsList({
  selectedClass,
  classStudents,
  unassignedStudents,
  loading,
  searchTerm,
  onSearchTermChange,
  filterValue,
  onFilterChange,
  viewMode,
  effectiveViewMode,
  isMobile,
  operationInProgress,
  onViewModeChange,
  onEditStudent,
  onQuickAssign,
  onRemoveFromClass,
  onShowGrades,
  onShowAbsences,
  onShowRubricCriteria,
}: Readonly<ClassStudentsListProps>) {
  const { t } = useI18n();

  if (!selectedClass) {
    return (
      <div className="dashboard-empty">
        <Users className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.classes.validation.schoolRequired')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-center">
        <Loader2 className="icon-spin" size={32} />
      </div>
    );
  }

  return (
    <>
      {/* Search Bars Container + View Toggle - All in same line */}
      <div className="dashboard-section-header" style={{ justifyContent: 'flex-start' }}>
        {/* Search Bar for Quick Add */}
        <div className="student-search-bar" style={{ flex: 1, marginBottom: 0 }}>
          <div className="student-search-wrapper">
            <input
              type="text"
              className={`student-search-input ${searchTerm && unassignedStudents.length > 0 ? 'has-suggestions' : ''}`}
              placeholder={t('dashboard.students.addToThisClass')}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
            <Search className="student-search-icon" size={18} />

            {/* Suggestions Dropdown */}
            {searchTerm && unassignedStudents.length > 0 && (
              <div className="student-suggestions">
                {unassignedStudents.map((student) => (
                  <button
                    key={student.id}
                    className="student-suggestion-item"
                    onClick={() => onQuickAssign(student)}
                    disabled={operationInProgress}
                  >
                    <div className="student-suggestion-info">
                      <p className="student-suggestion-name">{student.surnames}, {student.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar for Class Students */}
        <div className="student-search-bar" style={{ flex: 1, marginBottom: 0 }}>
          <div className="student-search-wrapper">
            <Search className="student-search-icon" size={18} />
            <input
              type="text"
              className="student-search-input"
              placeholder={t('dashboard.students.searchStudents')}
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        {classStudents.length > 0 && !isMobile && (
          <div className="view-toggle-group">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label={t('dashboard.students.gridView')}
              title={t('dashboard.students.gridView')}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              aria-label={t('dashboard.students.listView')}
              title={t('dashboard.students.listView')}
            >
              <List size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Students List */}
      {classStudents.length === 0 ? (
        <div className="dashboard-empty">
          <Users className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.students.noStudentsInClass')}</p>
        </div>
      ) : (
        <div className={effectiveViewMode === 'grid' ? 'students-grid' : 'students-list'}>
          {classStudents.map((student) => {
            const hasBirthday = isBirthday(student.dateOfBirth);
            return (
              <div key={student.id} className={`student-list-item ${hasBirthday ? 'birthday' : ''}`}>
                <ShapeBadge shape={student.shape} />
                <div className="student-list-left">
                  <StudentPhoto
                    studentId={student.id}
                    photoFileName={student.photo}
                    gender={student.gender}
                    size={80}
                    alt={`${student.name} ${student.surnames}`}
                  />
                  <div className="student-card-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 className="student-card-name">{student.surnames}, {student.name}</h4>
                      {hasBirthday && (
                        <Cake size={18} className="birthday-icon" aria-label={t('dashboard.students.birthdayToday')} />
                      )}
                    </div>
                    {hasBirthday && (
                      <span className="birthday-badge">
                        <Cake size={12} />
                        {t('dashboard.students.birthdayToday')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="student-list-actions">
                  <button
                    onClick={() => onEditStudent(student)}
                    className="school-action-btn edit tooltip-container"
                    disabled={operationInProgress}
                    aria-label={t('common.edit')}
                    data-tooltip={t('common.edit')}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => onShowGrades(student)}
                    className="school-action-btn edit tooltip-container"
                    aria-label={t('dashboard.evalCriteria.viewStudentGrades')}
                    data-tooltip={t('dashboard.evalCriteria.viewStudentGrades')}
                  >
                    <ClipboardList size={20} />
                  </button>
                  <button
                    onClick={() => onShowAbsences(student)}
                    className="school-action-btn edit tooltip-container"
                    aria-label={t('dashboard.attendance.viewAbsences')}
                    data-tooltip={t('dashboard.attendance.viewAbsences')}
                  >
                    <CalendarDays size={20} />
                  </button>
                  <button
                    onClick={() => onShowRubricCriteria(student)}
                    className="school-action-btn edit tooltip-container"
                    aria-label={t('dashboard.classRubrics.viewStudentCriteria')}
                    data-tooltip={t('dashboard.classRubrics.viewStudentCriteria')}
                  >
                    <Award size={20} />
                  </button>
                  <button
                    onClick={() => onRemoveFromClass(student, selectedClass)}
                    className="school-action-btn delete tooltip-container"
                    disabled={operationInProgress}
                    aria-label={t('dashboard.students.removeFromClass')}
                    data-tooltip={t('dashboard.students.removeFromClass')}
                  >
                    <UserMinus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

