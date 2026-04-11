import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../../lib/i18n';
import { Student, StudentService } from '../../infrastructure/api/StudentService';
import { School } from '../../infrastructure/api/SchoolService';
import { useIsMobile } from '../../lib/utils';
import { StudentSubTabsNav } from '../students/StudentSubTabsNav';
import type { StudentSubTab } from '../students/StudentSubTabsNav';
import { AllStudentsList } from '../students/AllStudentsList';
import { ClassStudentsList } from '../students/ClassStudentsList';
import { StudentFormModal } from '../modals/StudentFormModal';
import { AssignToClassModal } from '../modals/AssignToClassModal';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { StudentInfoModal } from '../modals/StudentInfoModal';
import { QuickAssignModal } from '../modals/QuickAssignModal';
import { RemoveFromClassModal } from '../modals/RemoveFromClassModal';
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

export function StudentsTab({
  selectedClass,
  schools,
  onRefreshSchools
}: Readonly<StudentsTabProps>) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [activeSubTab, setActiveSubTab] = useState<StudentSubTab>('class');
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

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    localStorage.setItem('studentsViewMode', viewMode);
  }, [viewMode]);

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

  return (
    <div className="dashboard-card">

      {/* Sub-tabs Navigation */}
      <StudentSubTabsNav activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />

      {/* Content */}
      {activeSubTab === 'class' && (
        <ClassStudentsList
          selectedClass={selectedClass}
          classStudents={classStudents}
          unassignedStudents={unassignedStudents}
          loading={loading}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          filterValue={filterClassStudents}
          onFilterChange={setFilterClassStudents}
          viewMode={viewMode}
          effectiveViewMode={effectiveViewMode}
          isMobile={isMobile}
          operationInProgress={removingFromClass}
          onViewModeChange={setViewMode}
          onEditStudent={handleEditStudent}
          onQuickAssign={handleQuickAssignClick}
          onRemoveFromClass={handleRemoveFromClassClick}
          onShowGrades={setGradesStudent}
          onShowAbsences={setAbsencesStudent}
          onShowRubricCriteria={setRubricCriteriaStudent}
        />
      )}
      {activeSubTab === 'all' && (
        <AllStudentsList
          students={allStudentsFiltered}
          loading={loading}
          filterValue={filterAllStudents}
          onFilterChange={setFilterAllStudents}
          operationInProgress={removingFromClass}
          schools={schools}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteClick}
          onAssignStudent={handleAssignClick}
          onRemoveFromClass={handleRemoveFromClassClick}
          onShowAdditionalInfo={setInfoPopupStudent}
        />
      )}
      {activeSubTab === 'evalCriteria' && <EvalCriteriaTab selectedClass={selectedClass} />}
      {activeSubTab === 'classRubrics' && <ClassRubricsTab selectedClass={selectedClass} />}
      {activeSubTab === 'cooperative' && <CooperativeTab selectedClass={selectedClass} />}
      {activeSubTab === 'attendance' && <AttendanceTab selectedClass={selectedClass} schools={schools} />}

      {/* Modals */}
      <StudentFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingStudent(null); }}
        onSuccess={() => { fetchStudents(); onRefreshSchools(); }}
        student={editingStudent}
      />

      {studentToAssign && (
        <AssignToClassModal
          isOpen={showAssignModal}
          onClose={() => { setShowAssignModal(false); setStudentToAssign(null); }}
          onSuccess={() => { fetchStudents(); onRefreshSchools(); }}
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
          onCancel={() => { setConfirmDeleteOpen(false); setStudentToDelete(null); }}
          isDeleting={deleting}
        />
      )}

      {infoPopupStudent && (
        <StudentInfoModal
          student={infoPopupStudent}
          onClose={() => setInfoPopupStudent(null)}
        />
      )}

      {confirmQuickAssign !== null && selectedClass !== null && (
        <QuickAssignModal
          student={confirmQuickAssign}
          isAssigning={removingFromClass}
          onConfirm={handleQuickAssign}
          onClose={() => setConfirmQuickAssign(null)}
        />
      )}

      {confirmRemoveFromClass && (
        <RemoveFromClassModal
          student={confirmRemoveFromClass.student}
          classId={confirmRemoveFromClass.classId}
          schools={schools}
          isRemoving={removingFromClass}
          onConfirm={handleRemoveFromClass}
          onClose={() => setConfirmRemoveFromClass(null)}
        />
      )}

      {gradesStudent !== null && selectedClass !== null && (
        <StudentGradesModal
          isOpen={true}
          onClose={() => setGradesStudent(null)}
          classId={selectedClass}
          studentId={gradesStudent.id}
          studentName={`${gradesStudent.surnames}, ${gradesStudent.name}`}
        />
      )}

      {absencesStudent !== null && selectedClass !== null && (
        <StudentAbsencesModal
          isOpen={true}
          onClose={() => setAbsencesStudent(null)}
          classId={selectedClass}
          studentId={absencesStudent.id}
          studentName={`${absencesStudent.surnames}, ${absencesStudent.name}`}
        />
      )}

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

