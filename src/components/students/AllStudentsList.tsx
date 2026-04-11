import React from 'react';
import { Users, Plus, Loader2, UserPlus, Edit, Trash2, X, Search, Info, Cake } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import type { Student, School } from '../../domain/models';
import { getStudentClasses, isBirthday } from '../../lib/utils';
import { StudentPhoto } from './StudentPhoto';
import { ShapeBadge } from './ShapeBadge';

interface ClassBadgeInternalProps {
  cls: { classId: number; schoolName: string; className: string; schoolYear: string };
  student: Student;
  disabled: boolean;
  onRemoveFromClass: (student: Student, classId: number) => void;
  label: string;
}

/** Badge showing a class assignment with a remove button */
function ClassBadgeItem({ cls, student, disabled, onRemoveFromClass, label }: Readonly<ClassBadgeInternalProps>) {
  const handleClick = () => onRemoveFromClass(student, cls.classId);
  return (
    <div className="student-class-badge">
      <span>{cls.schoolName} - {cls.className} - {cls.schoolYear}</span>
      <button onClick={handleClick} disabled={disabled} aria-label={label}>
        <X size={14} />
      </button>
    </div>
  );
}

interface AllStudentsListProps {
  /** Full list of students after filtering */
  students: Student[];
  /** Whether data is loading */
  loading: boolean;
  /** Search/filter value */
  filterValue: string;
  /** Callback when filter value changes */
  onFilterChange: (value: string) => void;
  /** Whether a class operation is in progress */
  operationInProgress: boolean;
  /** Schools list for resolving class info */
  schools: School[];
  /** Callbacks */
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onAssignStudent: (student: Student) => void;
  onRemoveFromClass: (student: Student, classId: number) => void;
  onShowAdditionalInfo: (student: Student) => void;
}

/**
 * Renders the "All Students" list view with search, add button, and student cards
 */
export function AllStudentsList({
  students,
  loading,
  filterValue,
  onFilterChange,
  operationInProgress,
  schools,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onAssignStudent,
  onRemoveFromClass,
  onShowAdditionalInfo,
}: Readonly<AllStudentsListProps>) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="loading-center">
        <Loader2 className="icon-spin" size={32} />
      </div>
    );
  }

  return (
    <>
      {/* Search Bar + Add Button */}
      <div className="dashboard-section-header" style={{ justifyContent: 'flex-start' }}>
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

        <button
          onClick={onAddStudent}
          className="dashboard-add-btn"
          disabled={loading}
        >
          <Plus size={16} className="icon-margin-right" />
          {t('dashboard.students.addStudent')}
        </button>
      </div>

      {students.length === 0 ? (
        <div className="dashboard-empty">
          <Users className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.students.noStudents')}</p>
        </div>
      ) : (
        <div className="students-list">
          {students.map((student) => {
            const studentClasses = getStudentClasses(student.classIds, schools);
            const hasBirthday = isBirthday(student.dateOfBirth);

            return (
              <div key={student.id} className={`student-list-item ${hasBirthday ? 'birthday' : ''}`}>
                <ShapeBadge shape={student.shape} />
                <div className="student-list-left">
                  <StudentPhoto
                    studentId={student.id}
                    photoFileName={student.photo}
                    gender={student.gender}
                    size={60}
                    alt={`${student.name} ${student.surnames}`}
                  />
                  <div className="student-card-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 className="student-card-name">{student.surnames}, {student.name}</h4>
                      {hasBirthday && (
                        <Cake size={18} className="birthday-icon" aria-label={t('dashboard.students.birthdayToday')} />
                      )}
                      {student.additionalInfo && (
                        <button
                          onClick={() => onShowAdditionalInfo(student)}
                          className="student-info-icon-btn tooltip-container"
                          aria-label={t('dashboard.students.additionalInfo')}
                          data-tooltip={t('dashboard.students.additionalInfo')}
                        >
                          <Info size={16} />
                        </button>
                      )}
                    </div>
                    <p className="student-card-detail">
                      {t('dashboard.students.dateOfBirth')}: {student.dateOfBirth}
                    </p>
                    {hasBirthday && (
                      <span className="birthday-badge">
                        <Cake size={12} />
                        {t('dashboard.students.birthdayToday')}
                      </span>
                    )}

                    {/* Assigned Classes */}
                    {studentClasses.length > 0 && (
                      <div className="student-classes-badges" style={{ marginTop: '0.5rem' }}>
                        {studentClasses.map((cls) => (
                          <ClassBadgeItem
                            key={cls.classId}
                            cls={cls}
                            student={student}
                            disabled={operationInProgress}
                            onRemoveFromClass={onRemoveFromClass}
                            label={`${t('dashboard.students.removeFromClass')} ${cls.className}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="student-list-actions">
                  <button
                    onClick={() => onAssignStudent(student)}
                    className="school-action-btn edit tooltip-container"
                    disabled={operationInProgress}
                    aria-label={t('dashboard.students.assignToClass')}
                    data-tooltip={t('dashboard.students.assignToClass')}
                  >
                    <UserPlus size={20} />
                  </button>
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
                    onClick={() => onDeleteStudent(student)}
                    className="school-action-btn delete tooltip-container"
                    disabled={operationInProgress}
                    aria-label={t('common.delete')}
                    data-tooltip={t('common.delete')}
                  >
                    <Trash2 size={20} />
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

