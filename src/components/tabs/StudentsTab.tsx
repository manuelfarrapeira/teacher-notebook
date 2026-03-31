import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Plus, Loader2, UserPlus, UserMinus, Edit, Trash2, X, Search, Info, Grid3x3, List, Cake, ClipboardList, CalendarDays, Award, ChevronDown } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Student, StudentService, Shape } from '../../services/StudentService';
import { School } from '../../services/SchoolService';
import { getStudentClasses, useIsMobile, isBirthday } from '../../lib/utils';
import { StudentPhoto } from '../students/StudentPhoto';
import { StudentFormModal } from '../modals/StudentFormModal';
import { AssignToClassModal } from '../modals/AssignToClassModal';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { StudentGradesModal } from '../modals/StudentGradesModal';
import { StudentAbsencesModal } from '../modals/StudentAbsencesModal';
import { StudentRubricCriteriaModal } from '../modals/StudentRubricCriteriaModal';
import { EvalCriteriaTab } from './EvalCriteriaTab';
import { ClassRubricsTab } from './ClassRubricsTab';
import { AttendanceTab } from './AttendanceTab';
import { CooperativeTab } from './CooperativeTab';

interface StudentsTabProps {
  selectedSchool: number | null;
  selectedClass: number | null;
  schools: School[];
  onRefreshSchools: () => void;
}

/**
 * Renders a colored shape badge for a student (optional visual identifier)
 */
function renderShapeBadge(shape?: Shape) {
  if (!shape) return null;
  if (shape === 'CIRCLE') {
    return (
      <span className="student-shape-badge" aria-label="Círculo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" fill="#ef4444" stroke="#000" strokeWidth="0.8"/>
        </svg>
      </span>
    );
  }
  if (shape === 'TRIANGLE') {
    return (
      <span className="student-shape-badge" aria-label="Triángulo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,3 22,21 2,21" fill="#3b82f6" stroke="#000" strokeWidth="0.8" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  if (shape === 'SQUARE') {
    return (
      <span className="student-shape-badge" aria-label="Cuadrado">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" stroke="#000" strokeWidth="0.8"/>
        </svg>
      </span>
    );
  }
  return null;
}

interface ClassBadgeProps {
  cls: { classId: number; schoolName: string; className: string; schoolYear: string };
  student: Student;
  disabled: boolean;
  onRemoveFromClass: (student: Student, classId: number) => void;
  label: string;
}

function ClassBadge({ cls, student, disabled, onRemoveFromClass, label }: Readonly<ClassBadgeProps>) {
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

export function StudentsTab({
  selectedClass,
  schools,
  onRefreshSchools
}: Readonly<StudentsTabProps>) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'class' | 'evalCriteria' | 'classRubrics' | 'attendance' | 'cooperative'>('class');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('studentsViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });
  const effectiveViewMode = isMobile ? 'list' : viewMode;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAllStudents, setFilterAllStudents] = useState('');
  const [filterClassStudents, setFilterClassStudents] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState<Student | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [removingFromClass, setRemovingFromClass] = useState(false);
  const [infoPopupStudent, setInfoPopupStudent] = useState<Student | null>(null);
  const [confirmQuickAssign, setConfirmQuickAssign] = useState<Student | null>(null);
  const [confirmRemoveFromClass, setConfirmRemoveFromClass] = useState<{student: Student; classId: number} | null>(null);
  const [gradesStudent, setGradesStudent] = useState<Student | null>(null);
  const [absencesStudent, setAbsencesStudent] = useState<Student | null>(null);
  const [rubricCriteriaStudent, setRubricCriteriaStudent] = useState<Student | null>(null);
  const [isSubTabDropdownOpen, setIsSubTabDropdownOpen] = useState(false);
  const subTabDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    localStorage.setItem('studentsViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subTabDropdownRef.current && !subTabDropdownRef.current.contains(event.target as Node)) {
        setIsSubTabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentData = await StudentService.getStudents();
      setStudents(studentData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.loadError'));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    setDeleting(true);
    try {
      await StudentService.deleteStudent(studentToDelete.id);
      setSuccessMessage(t('dashboard.students.deleteSuccess'));
      setSuccessDialogOpen(true);
      fetchStudents();
      onRefreshSchools();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.deleteError'));
      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleAssignClick = (student: Student) => {
    setStudentToAssign(student);
    setShowAssignModal(true);
  };

  const handleRemoveFromClassClick = (student: Student, classId: number) => {
    setConfirmRemoveFromClass({ student, classId });
  };

  const handleRemoveFromClass = async () => {
    if (!confirmRemoveFromClass) return;

    const { student, classId } = confirmRemoveFromClass;
    setRemovingFromClass(true);
    try {
      await StudentService.removeFromClass(classId, student.id);
      setSuccessMessage(t('dashboard.students.removeSuccess'));
      setSuccessDialogOpen(true);
      await fetchStudents();
      onRefreshSchools();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.removeError'));
      setErrorDialogOpen(true);
    } finally {
      setRemovingFromClass(false);
      setConfirmRemoveFromClass(null);
    }
  };

  const toggleAdditionalInfo = (student: Student) => {
    setInfoPopupStudent(student);
  };

  const handleQuickAssignClick = (student: Student) => {
    setConfirmQuickAssign(student);
  };

  const handleQuickAssign = async () => {
    if (!selectedClass || !confirmQuickAssign) return;

    setRemovingFromClass(true);
    try {
      await StudentService.assignToClass(selectedClass, confirmQuickAssign.id);
      setSuccessMessage(t('dashboard.students.assignSuccess'));
      setSuccessDialogOpen(true);
      setSearchTerm('');
      await fetchStudents();
      onRefreshSchools();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('dashboard.students.assignError'));
      setErrorDialogOpen(true);
    } finally {
      setRemovingFromClass(false);
      setConfirmQuickAssign(null);
    }
  };

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    let filtered = students.filter(s => s.classIds.includes(selectedClass));

    if (filterClassStudents.trim()) {
      const term = filterClassStudents.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.surnames.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [students, selectedClass, filterClassStudents]);

  const allStudentsFiltered = useMemo(() => {
    if (!filterAllStudents.trim()) return students;

    const term = filterAllStudents.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.surnames.toLowerCase().includes(term)
    );
  }, [students, filterAllStudents]);

  const unassignedStudents = useMemo(() => {
    if (!selectedClass || !searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return students.filter(s =>
      !s.classIds.includes(selectedClass) &&
      (s.name.toLowerCase().includes(term) || s.surnames.toLowerCase().includes(term))
    );
  }, [students, selectedClass, searchTerm]);

  const renderAllStudents = () => {
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
                value={filterAllStudents}
                onChange={(e) => setFilterAllStudents(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleAddStudent}
            className="dashboard-add-btn"
            disabled={loading}
          >
            <Plus size={16} className="icon-margin-right" />
            {t('dashboard.students.addStudent')}
          </button>
        </div>

        {allStudentsFiltered.length === 0 ? (
          <div className="dashboard-empty">
            <Users className="dashboard-empty-icon" />
            <p className="dashboard-empty-text">{t('dashboard.students.noStudents')}</p>
          </div>
        ) : (
          <div className="students-list">
            {allStudentsFiltered.map((student) => {
              const studentClasses = getStudentClasses(student.classIds, schools);
              const hasBirthday = isBirthday(student.dateOfBirth);

              return (
                <div key={student.id} className={`student-list-item ${hasBirthday ? 'birthday' : ''}`}>
                  {/* ...existing student item code... */}
                  {renderShapeBadge(student.shape)}
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
                        onClick={() => toggleAdditionalInfo(student)}
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
                        <ClassBadge
                          key={cls.classId}
                          cls={cls}
                          student={student}
                          disabled={removingFromClass}
                          onRemoveFromClass={handleRemoveFromClassClick}
                          label={`${t('dashboard.students.removeFromClass')} ${cls.className}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="student-list-actions">
                <button
                  onClick={() => handleAssignClick(student)}
                  className="school-action-btn edit tooltip-container"
                  disabled={removingFromClass}
                  aria-label={t('dashboard.students.assignToClass')}
                  data-tooltip={t('dashboard.students.assignToClass')}
                >
                  <UserPlus size={20} />
                </button>
                <button
                  onClick={() => handleEditStudent(student)}
                  className="school-action-btn edit tooltip-container"
                  disabled={removingFromClass}
                  aria-label={t('common.edit')}
                  data-tooltip={t('common.edit')}
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteClick(student)}
                  className="school-action-btn delete tooltip-container"
                  disabled={removingFromClass}
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
  };

  const renderClassStudents = () => {
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="student-search-icon" size={18} />

              {/* Suggestions Dropdown */}
              {searchTerm && unassignedStudents.length > 0 && (
                <div className="student-suggestions">
                  {unassignedStudents.map((student) => (
                    <button
                      key={student.id}
                      className="student-suggestion-item"
                      onClick={() => handleQuickAssignClick(student)}
                      disabled={removingFromClass}
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
                value={filterClassStudents}
                onChange={(e) => setFilterClassStudents(e.target.value)}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          {classStudents.length > 0 && !isMobile && (
            <div className="view-toggle-group">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                aria-label={t('dashboard.students.gridView')}
                title={t('dashboard.students.gridView')}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
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
                {renderShapeBadge(student.shape)}
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
                    onClick={() => handleEditStudent(student)}
                    className="school-action-btn edit tooltip-container"
                    disabled={removingFromClass}
                    aria-label={t('common.edit')}
                    data-tooltip={t('common.edit')}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => setGradesStudent(student)}
                    className="school-action-btn edit tooltip-container"
                    aria-label={t('dashboard.rubrics.viewStudentGrades')}
                    data-tooltip={t('dashboard.rubrics.viewStudentGrades')}
                  >
                    <ClipboardList size={20} />
                  </button>
                  <button
                    onClick={() => setAbsencesStudent(student)}
                    className="school-action-btn edit tooltip-container"
                    aria-label={t('dashboard.attendance.viewAbsences')}
                    data-tooltip={t('dashboard.attendance.viewAbsences')}
                  >
                    <CalendarDays size={20} />
                  </button>
                  <button
                    onClick={() => setRubricCriteriaStudent(student)}
                    className="school-action-btn edit tooltip-container"
                    aria-label={t('dashboard.classRubrics.viewStudentCriteria')}
                    data-tooltip={t('dashboard.classRubrics.viewStudentCriteria')}
                  >
                    <Award size={20} />
                  </button>
                  <button
                    onClick={() => handleRemoveFromClassClick(student, selectedClass)}
                    className="school-action-btn delete tooltip-container"
                    disabled={removingFromClass}
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
  };

  return (
    <div className="dashboard-card">

      {/* Sub-tabs Navigation */}
      {isMobile ? (
        <div className="student-tabs-dropdown" ref={subTabDropdownRef}>
          <button
            className="student-tabs-dropdown-trigger"
            onClick={() => setIsSubTabDropdownOpen(!isSubTabDropdownOpen)}
          >
            <span>
              {activeSubTab === 'class' && t('dashboard.students.classStudents')}
              {activeSubTab === 'evalCriteria' && t('dashboard.rubrics.title')}
              {activeSubTab === 'classRubrics' && t('dashboard.classRubrics.title')}
              {activeSubTab === 'attendance' && t('dashboard.attendance.title')}
              {activeSubTab === 'cooperative' && t('dashboard.cooperative.title')}
              {activeSubTab === 'all' && t('dashboard.students.allStudents')}
            </span>
            <ChevronDown size={16} className={`chevron-icon ${isSubTabDropdownOpen ? 'open' : ''}`} />
          </button>
          {isSubTabDropdownOpen && (
            <div className="student-tabs-dropdown-menu">
              <button
                className={`student-tabs-dropdown-option ${activeSubTab === 'class' ? 'active' : ''}`}
                onClick={() => { setActiveSubTab('class'); setIsSubTabDropdownOpen(false); }}
              >
                {t('dashboard.students.classStudents')}
              </button>
              <button
                className={`student-tabs-dropdown-option ${activeSubTab === 'evalCriteria' ? 'active' : ''}`}
                onClick={() => { setActiveSubTab('evalCriteria'); setIsSubTabDropdownOpen(false); }}
              >
                {t('dashboard.rubrics.title')}
              </button>
              <button
                className={`student-tabs-dropdown-option ${activeSubTab === 'classRubrics' ? 'active' : ''}`}
                onClick={() => { setActiveSubTab('classRubrics'); setIsSubTabDropdownOpen(false); }}
              >
                {t('dashboard.classRubrics.title')}
              </button>
              <button
                className={`student-tabs-dropdown-option ${activeSubTab === 'cooperative' ? 'active' : ''}`}
                onClick={() => { setActiveSubTab('cooperative'); setIsSubTabDropdownOpen(false); }}
              >
                {t('dashboard.cooperative.title')}
              </button>
              <button
                className={`student-tabs-dropdown-option ${activeSubTab === 'attendance' ? 'active' : ''}`}
                onClick={() => { setActiveSubTab('attendance'); setIsSubTabDropdownOpen(false); }}
              >
                {t('dashboard.attendance.title')}
              </button>
              <button
                className={`student-tabs-dropdown-option ${activeSubTab === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveSubTab('all'); setIsSubTabDropdownOpen(false); }}
              >
                {t('dashboard.students.allStudents')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="student-tabs">
          <button
            className={activeSubTab === 'class' ? 'active' : ''}
            onClick={() => setActiveSubTab('class')}
          >
            {t('dashboard.students.classStudents')}
          </button>
          <button
            className={activeSubTab === 'evalCriteria' ? 'active' : ''}
            onClick={() => setActiveSubTab('evalCriteria')}
          >
            {t('dashboard.rubrics.title')}
          </button>
          <button
            className={activeSubTab === 'classRubrics' ? 'active' : ''}
            onClick={() => setActiveSubTab('classRubrics')}
          >
            {t('dashboard.classRubrics.title')}
          </button>
          <button
            className={activeSubTab === 'cooperative' ? 'active' : ''}
            onClick={() => setActiveSubTab('cooperative')}
          >
            {t('dashboard.cooperative.title')}
          </button>
          <button
            className={activeSubTab === 'attendance' ? 'active' : ''}
            onClick={() => setActiveSubTab('attendance')}
          >
            {t('dashboard.attendance.title')}
          </button>
          <button
            className={activeSubTab === 'all' ? 'active' : ''}
            onClick={() => setActiveSubTab('all')}
          >
            {t('dashboard.students.allStudents')}
          </button>
        </div>
      )}

      {/* Content */}
      {activeSubTab === 'class' && renderClassStudents()}
      {activeSubTab === 'all' && renderAllStudents()}
      {activeSubTab === 'evalCriteria' && <EvalCriteriaTab selectedClass={selectedClass} />}
      {activeSubTab === 'classRubrics' && <ClassRubricsTab selectedClass={selectedClass} />}
      {activeSubTab === 'cooperative' && <CooperativeTab selectedClass={selectedClass} />}
      {activeSubTab === 'attendance' && <AttendanceTab selectedClass={selectedClass} schools={schools} />}

      {/* Modals */}
      <StudentFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStudent(null);
        }}
        onSuccess={() => {
          fetchStudents();
          onRefreshSchools();
        }}
        student={editingStudent}
      />

      {studentToAssign && (
        <AssignToClassModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setStudentToAssign(null);
          }}
          onSuccess={() => {
            fetchStudents();
            onRefreshSchools();
          }}
          student={studentToAssign}
          schools={schools}
        />
      )}

      <ErrorModal
        isOpen={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      <SuccessModal
        isOpen={successDialogOpen}
        message={successMessage}
        onClose={() => setSuccessDialogOpen(false)}
      />

      {studentToDelete && (
        <ConfirmDeleteModal
          isOpen={confirmDeleteOpen}
          title={t('dashboard.students.deleteTitle')}
          itemName={`${studentToDelete.name} ${studentToDelete.surnames}`}
          confirmMessage={t('dashboard.students.deleteConfirm')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setConfirmDeleteOpen(false);
            setStudentToDelete(null);
          }}
          isDeleting={deleting}
        />
      )}

      {/* Additional Info Popup */}
      {infoPopupStudent && (
        <dialog className="modal-overlay" open={true}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
            <div className="modal-content" style={{ maxWidth: '500px', width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="modal-title">{t('dashboard.students.additionalInfo')}</h3>
                <button
                  onClick={() => setInfoPopupStudent(null)}
                  className="modal-button cancel"
                  style={{ padding: '0.5rem', minWidth: 'auto' }}
                  aria-label={t('common.close')}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', margin: 0 }}>
                  {infoPopupStudent.additionalInfo}
                </p>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#7a8078' }}>
                <strong>{infoPopupStudent.name} {infoPopupStudent.surnames}</strong>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Quick Assign Confirmation Modal */}
      {confirmQuickAssign !== null && selectedClass !== null && (
        <dialog className="modal-overlay" open={true}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
            <div className="modal-content" style={{ maxWidth: '450px', width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="modal-title">{t('dashboard.students.confirmAssignTitle')}</h3>
                <button
                  onClick={() => setConfirmQuickAssign(null)}
                  className="modal-button cancel"
                  style={{ padding: '0.5rem', minWidth: 'auto' }}
                  aria-label={t('common.close')}
                  disabled={removingFromClass}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {t('dashboard.students.confirmAssignMessage')}
                </p>
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontWeight: 600, color: '#1e40af', margin: 0 }}>
                    {confirmQuickAssign.name} {confirmQuickAssign.surnames}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#3b82f6', margin: '0.25rem 0 0 0' }}>
                    {t('dashboard.students.dateOfBirth')}: {confirmQuickAssign.dateOfBirth}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setConfirmQuickAssign(null)}
                  className="modal-button cancel"
                  disabled={removingFromClass}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleQuickAssign}
                  className="modal-button save"
                  disabled={removingFromClass}
                >
                  {removingFromClass && <Loader2 className="animate-spin" size={16} />}
                  {t('dashboard.students.confirmAssign')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Remove from Class Confirmation Modal */}
      {confirmRemoveFromClass && (() => {
        const classInfo = schools
          .flatMap(school =>
            school.classes.map(cls => ({
              ...cls,
              schoolName: school.name
            }))
          )
          .find(cls => cls.id === confirmRemoveFromClass.classId);

        const className = classInfo ? `${classInfo.name} (${classInfo.schoolYear})` : '';
        const studentName = `${confirmRemoveFromClass.student.name} ${confirmRemoveFromClass.student.surnames}`;
        const message = t('dashboard.students.confirmRemoveMessage')
          .replace('{studentName}', studentName)
          .replace('{className}', className);

        return (
          <dialog className="modal-overlay" open={true}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
              <div className="modal-content" style={{ maxWidth: '450px', width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="modal-title">{t('dashboard.students.removeFromClassTitle')}</h3>
                  <button
                    onClick={() => setConfirmRemoveFromClass(null)}
                    className="modal-button cancel"
                    style={{ padding: '0.5rem', minWidth: 'auto' }}
                    aria-label={t('common.close')}
                    disabled={removingFromClass}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <p style={{ fontSize: '0.95rem', color: '#3d4440', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {message}
                  </p>
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontWeight: 600, color: '#991b1b', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                      {studentName}
                    </p>
                    {classInfo && (
                      <>
                        <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: '0.25rem 0' }}>
                          <strong>{t('dashboard.students.school')}:</strong> {classInfo.schoolName}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: '0.25rem 0 0 0' }}>
                          <strong>{t('dashboard.students.class')}:</strong> {classInfo.name} - {classInfo.schoolYear}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    onClick={() => setConfirmRemoveFromClass(null)}
                    className="modal-button cancel"
                    disabled={removingFromClass}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleRemoveFromClass}
                    className="modal-button save"
                    style={{ backgroundColor: '#dc2626' }}
                    disabled={removingFromClass}
                  >
                    {removingFromClass && <Loader2 className="animate-spin" size={16} />}
                    {t('dashboard.students.confirmRemove')}
                  </button>
                </div>
              </div>
            </div>
          </dialog>
        );
      })()}

      {/* Student Grades Modal */}
      {gradesStudent !== null && selectedClass !== null && (
        <StudentGradesModal
          isOpen={true}
          onClose={() => setGradesStudent(null)}
          classId={selectedClass}
          studentId={gradesStudent.id}
          studentName={`${gradesStudent.surnames}, ${gradesStudent.name}`}
        />
      )}

      {/* Student Absences Summary Modal */}
      {absencesStudent !== null && selectedClass !== null && (
        <StudentAbsencesModal
          isOpen={true}
          onClose={() => setAbsencesStudent(null)}
          classId={selectedClass}
          studentId={absencesStudent.id}
          studentName={`${absencesStudent.surnames}, ${absencesStudent.name}`}
        />
      )}

      {/* Student Rubric Criteria Summary Modal */}
      {rubricCriteriaStudent !== null && selectedClass !== null && (
        <StudentRubricCriteriaModal
          isOpen={true}
          onClose={() => setRubricCriteriaStudent(null)}
          classId={selectedClass}
          studentId={rubricCriteriaStudent.id}
          studentName={`${rubricCriteriaStudent.surnames}, ${rubricCriteriaStudent.name}`}
        />
      )}
    </div>
  );
}

