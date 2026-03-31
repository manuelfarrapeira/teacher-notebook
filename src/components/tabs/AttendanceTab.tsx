import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, CalendarDays, Check, UserX } from 'lucide-react';
import { useI18n, translations } from '../../lib/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { SubjectService, ClassSubject } from '../../services/SubjectService';
import { StudentService, Student } from '../../services/StudentService';
import { AbsenceService, Absence } from '../../services/AbsenceService';
import { ApiErrorException } from '../../services/BaseService';
import { School } from '../../services/SchoolService';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { StudentPhoto } from '../students/StudentPhoto';

/** Represents a single calendar day in the attendance grid */
interface CalendarDay {
  /** Date object */
  date: Date;
  /** Day of month (1-31) */
  dayNum: number;
  /** Day of week: 0=Sun … 6=Sat */
  dow: number;
  /** DD/MM/YYYY string sent to the API */
  dateStr: string;
  /** Whether this day is Saturday or Sunday */
  isWeekend: boolean;
  /** Whether this day is today */
  isToday: boolean;
}

/** A month grouping for the top header row */
interface MonthGroup {
  label: string;
  days: number;
}

/**
 * Parse schoolYear string "25/26" into { startYear: 2025, endYear: 2026 }
 */
function parseSchoolYear(schoolYear: string): { startYear: number; endYear: number } {
  const parts = schoolYear.split('/');
  const a = Number.parseInt(parts[0], 10);
  const b = Number.parseInt(parts[1], 10);
  return { startYear: 2000 + a, endYear: 2000 + b };
}

/**
 * Generate all days from 1 September of startYear to 30 June of endYear
 */
function generateSchoolDays(startYear: number, endYear: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const start = new Date(startYear, 8, 1); // Sept 1
  const end = new Date(endYear, 5, 30); // Jun 30

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = new Date(start);
  while (current <= end) {
    const dow = current.getDay();
    const d = current.getDate();
    const m = current.getMonth() + 1;
    const y = current.getFullYear();
    const dateStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;

    const dayDate = new Date(current);
    dayDate.setHours(0, 0, 0, 0);

    days.push({
      date: new Date(current),
      dayNum: d,
      dow,
      dateStr,
      isWeekend: dow === 0 || dow === 6,
      isToday: dayDate.getTime() === today.getTime(),
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Group days into months for the colspan header
 */
function groupByMonth(days: CalendarDay[], monthNames: string[], startYear: number, endYear: number): MonthGroup[] {
  const groups: MonthGroup[] = [];
  // Months: Sept(8)=0, Oct(9)=1, Nov(10)=2, Dec(11)=3, Jan(0)=4, Feb(1)=5, Mar(2)=6, Apr(3)=7, May(4)=8, Jun(5)=9
  const monthOrder = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5]; // JS month indices

  for (let i = 0; i < monthOrder.length; i++) {
    const jsMonth = monthOrder[i];
    const year = jsMonth >= 8 ? startYear : endYear;
    const count = days.filter(d => d.date.getMonth() === jsMonth && d.date.getFullYear() === year).length;
    if (count > 0) {
      groups.push({ label: monthNames[i], days: count });
    }
  }

  return groups;
}

/**
 * Day abbreviation based on JS day of week (0=Sun … 6=Sat)
 * dayAbbreviations array: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] = index 0-6
 */
function getDayAbbr(dow: number, dayAbbreviations: string[]): string {
  // dow: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  // dayAbbreviations: [Lu,Ma,Mi,Ju,Vi,Sá,Do] = [Mon,Tue,Wed,Thu,Fri,Sat,Sun]
  const map = [6, 0, 1, 2, 3, 4, 5]; // dow → dayAbbreviations index
  return dayAbbreviations[map[dow]];
}

/**
 * Format today's date as DD/MM/YYYY
 */
function todayStr(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Props for AttendanceTab */
interface AttendanceTabProps {
  /** Currently selected class ID */
  readonly selectedClass: number | null;
  /** All schools (to derive schoolYear) */
  readonly schools: School[];
}

/**
 * AttendanceTab — Spreadsheet-style attendance management
 */
export function AttendanceTab({ selectedClass, schools }: AttendanceTabProps) {
  const { t, locale } = useI18n();

  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(false);
  const [operatingCells, setOperatingCells] = useState<Set<string>>(new Set());
  const [operatingFullDay, setOperatingFullDay] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);

  // Full-day absence modal state
  const [showFullDayModal, setShowFullDayModal] = useState(false);
  const [fullDayStudentId, setFullDayStudentId] = useState<number>(0);
  const [fullDayDate, setFullDayDate] = useState<string>(todayStr());

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Ref for auto-scroll to today
  const todayRef = useRef<HTMLTableCellElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /** Derive schoolYear from schools + selectedClass */
  const schoolYear = useMemo(() => {
    if (!selectedClass) return null;
    for (const school of schools) {
      const cls = school.classes.find(c => c.id === selectedClass);
      if (cls) return cls.schoolYear;
    }
    return null;
  }, [selectedClass, schools]);

  /** Parse into start/end years */
  const years = useMemo(() => {
    if (!schoolYear) return null;
    return parseSchoolYear(schoolYear);
  }, [schoolYear]);

  /** Generate all school days */
  const schoolDays = useMemo(() => {
    if (!years) return [];
    return generateSchoolDays(years.startYear, years.endYear);
  }, [years]);

  /** Month groups for header */
  const monthGroups = useMemo(() => {
    if (!years || schoolDays.length === 0) return [];
    const monthNames = translations[locale].dashboard.attendance.monthNames;
    return groupByMonth(schoolDays, monthNames, years.startYear, years.endYear);
  }, [schoolDays, years, locale]);

  /** Day abbreviations */
  const dayAbbreviations = useMemo(() => {
    return translations[locale].dashboard.attendance.dayAbbreviations;
  }, [locale]);

  // ---------- Data fetching ----------

  const fetchSubjects = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await SubjectService.getClassSubjects(selectedClass);
      setClassSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].subjectId);
      }
    } catch (error) {
      console.error('Error fetching class subjects:', error);
    }
  }, [selectedClass]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const allStudents = await StudentService.getStudents();
      const filtered = allStudents.filter(s => s.classIds.includes(selectedClass));
      filtered.sort((a, b) => a.surnames.localeCompare(b.surnames));
      setClassStudents(filtered);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [selectedClass]);

  const fetchAbsences = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await AbsenceService.getAllAbsences(selectedClass);
      setAbsences(data);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  }, [selectedClass]);

  const loadAll = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      await Promise.all([fetchSubjects(), fetchStudents(), fetchAbsences()]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchSubjects, fetchStudents, fetchAbsences]);

  useEffect(() => {
    if (selectedClass) {
      setSelectedSubjectId(0);
      loadAll();
    } else {
      setClassSubjects([]);
      setClassStudents([]);
      setAbsences([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (classSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(classSubjects[0].subjectId);
    }
  }, [classSubjects]);

  // Auto-scroll to today after data loads
  useEffect(() => {
    if (!loading && todayRef.current && wrapperRef.current) {
      // small delay so the DOM is fully painted
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, schoolDays]);

  // ---------- Absence lookup map ----------

  /** Map key: "studentId-subjectId-DD/MM/YYYY" → Absence */
  const absenceMap = useMemo(() => {
    const map = new Map<string, Absence>();
    for (const a of absences) {
      map.set(`${a.studentId}-${a.subjectId}-${a.absenceDate}`, a);
    }
    return map;
  }, [absences]);

  /** Count absences for a student for the selected subject */
  const getAbsenceCount = (studentId: number): number => {
    if (!selectedSubjectId) return 0;
    return absences.filter(a => a.studentId === studentId && a.subjectId === selectedSubjectId).length;
  };

  // ---------- Actions ----------

  /** Helper to get the correct error message for absence operations */
  const getAbsenceErrorMessage = (isDelete: boolean): string => {
    return isDelete ? t('dashboard.attendance.deleteError') : t('dashboard.attendance.createError');
  };

  /**
   * Extract the human-readable detail from backend API errors.
   * Priority: detail → details[].reason → description → fallback
   */
  const parseErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof ApiErrorException) {
      const { detail, details, description } = error.apiError;
      if (detail) return detail;
      if (details && details.length > 0) {
        return details.map(d => d.reason).join('. ');
      }
      return description || fallback;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  };

  const handleToggleAbsence = async (studentId: number, day: CalendarDay) => {
    if (!selectedClass || !selectedSubjectId || day.isWeekend) return;

    const cellKey = `${studentId}-${selectedSubjectId}-${day.dateStr}`;
    if (operatingCells.has(cellKey)) return;

    const existing = absenceMap.get(cellKey);

    setOperatingCells(prev => new Set(prev).add(cellKey));
    try {
      if (existing) {
        await AbsenceService.deleteAbsenceById(existing.id);
      } else {
        await AbsenceService.createAbsence(selectedClass, {
          studentId,
          subjectId: selectedSubjectId,
          date: day.dateStr,
        });
      }
      await fetchAbsences();
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, getAbsenceErrorMessage(Boolean(existing))));
      setErrorDialogOpen(true);
    } finally {
      setOperatingCells(prev => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubjectId(Number(value));
  };

  const handleFullDaySubmit = async () => {
    if (!selectedClass || !fullDayStudentId || !fullDayDate) return;

    setOperatingFullDay(true);
    try {
      await AbsenceService.createAbsence(selectedClass, {
        studentId: fullDayStudentId,
        date: fullDayDate,
      });
      setShowFullDayModal(false);
      await fetchAbsences();
      setSuccessMessage(t('dashboard.attendance.fullDayCreated'));
      setSuccessDialogOpen(true);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, t('dashboard.attendance.createError')));
      setErrorDialogOpen(true);
    } finally {
      setOperatingFullDay(false);
    }
  };

  const openFullDayModal = () => {
    setFullDayStudentId(classStudents.length > 0 ? classStudents[0].id : 0);
    setFullDayDate(todayStr());
    setShowFullDayModal(true);
  };

  /** Convert DD/MM/YYYY to YYYY-MM-DD for date input */
  const toInputDate = (ddmmyyyy: string): string => {
    const parts = ddmmyyyy.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  /** Convert YYYY-MM-DD to DD/MM/YYYY */
  const fromInputDate = (isoDate: string): string => {
    const parts = isoDate.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // ---------- Render guards ----------

  if (!selectedClass) {
    return (
      <div className="dashboard-empty">
        <CalendarDays className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.attendance.noClassSelected')}</p>
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

  if (classSubjects.length === 0) {
    return (
      <div className="dashboard-empty">
        <CalendarDays className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.attendance.noSubjectsInClass')}</p>
      </div>
    );
  }

  // ---------- Render full-day modal ----------

  const fullDayStudentName = (() => {
    const s = classStudents.find(st => st.id === fullDayStudentId);
    return s ? `${s.surnames}, ${s.name}` : '';
  })();

  const confirmMessage = t('dashboard.attendance.fullDayConfirm')
    .replace('{studentName}', fullDayStudentName)
    .replace('{date}', fullDayDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Toolbar */}
      <div className="attendance-toolbar">
        <Select value={selectedSubjectId ? String(selectedSubjectId) : ''} onValueChange={handleSubjectChange}>
          <SelectTrigger className="attendance-subject-select">
            <SelectValue placeholder={t('dashboard.attendance.subject')} />
          </SelectTrigger>
          <SelectContent>
            {classSubjects.map(cs => (
              <SelectItem key={cs.subjectId} value={String(cs.subjectId)}>
                {cs.subjectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          className="attendance-full-day-btn"
          onClick={openFullDayModal}
          disabled={classStudents.length === 0}
        >
          <UserX size={16} />
          {t('dashboard.attendance.fullDayAbsence')}
        </button>
      </div>

      {/* Table */}
      {classStudents.length === 0 ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty-text">{t('dashboard.students.noStudentsInClass')}</p>
        </div>
      ) : (
        <div className="attendance-table-container">
          <div className="attendance-table-wrapper" ref={wrapperRef}>
            <table className="attendance-table">
              <thead>
                {/* Month header row */}
                <tr>
                  <th className="attendance-student-col attendance-month-header">&nbsp;</th>
                  <th className="attendance-count-col attendance-month-header">&nbsp;</th>
                  {monthGroups.map((mg) => (
                    <th
                      key={mg.label}
                      colSpan={mg.days}
                      className="attendance-month-header"
                    >
                      {mg.label}
                    </th>
                  ))}
                </tr>
                {/* Day header row */}
                <tr>
                  <th className="attendance-student-col">
                    {t('dashboard.rubrics.student')}
                  </th>
                  <th className="attendance-count-col">
                    {t('dashboard.attendance.absenceCount')}
                  </th>
                  {schoolDays.map((day) => {
                    const classes = [
                      'attendance-day-header',
                      day.isWeekend ? 'attendance-weekend' : '',
                      day.isToday ? 'attendance-day-today' : '',
                    ].filter(Boolean).join(' ');

                    return (
                      <th
                        key={day.dateStr}
                        className={classes}
                        ref={day.isToday ? todayRef : undefined}
                      >
                        <span className="attendance-day-name">{getDayAbbr(day.dow, dayAbbreviations)}</span>
                        <span className="attendance-day-num">{day.dayNum}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, sIdx) => {
                  const count = getAbsenceCount(student.id);
                  return (
                    <tr key={student.id}>
                      <td className="attendance-student-col">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span>{sIdx + 1}. {student.surnames}, {student.name}</span>
                          <StudentPhoto
                            studentId={student.id}
                            photoFileName={student.photo}
                            gender={student.gender}
                            size={42}
                            alt={`${student.name} ${student.surnames}`}
                          />
                        </div>
                      </td>
                      <td className="attendance-count-col">
                        {count > 0 ? count : ''}
                      </td>
                      {schoolDays.map((day) => {
                        if (day.isWeekend) {
                          return (
                            <td key={day.dateStr} className="attendance-cell attendance-weekend-cell">
                              &nbsp;
                            </td>
                          );
                        }

                        const key = `${student.id}-${selectedSubjectId}-${day.dateStr}`;
                        const isChecked = absenceMap.has(key);
                        const isCellLoading = operatingCells.has(key);

                        const cellClasses = [
                          'attendance-cell',
                          day.isToday ? 'attendance-cell-today' : '',
                        ].filter(Boolean).join(' ');

                        return (
                          <td key={day.dateStr} className={cellClasses}>
                            {isCellLoading ? (
                              <Loader2 className="animate-spin" size={14} style={{ color: '#2c5f4a', margin: '0 auto' }} />
                            ) : (
                              <button
                                className={`attendance-checkbox ${isChecked ? 'checked' : ''}`}
                                onClick={() => handleToggleAbsence(student.id, day)}
                                aria-label={`${student.surnames}, ${student.name} - ${day.dateStr}`}
                                type="button"
                              >
                                {isChecked && <Check size={12} />}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Day Absence Modal */}
      {showFullDayModal && (
        <dialog className="modal-overlay" open={true}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
            <div className="modal-content" style={{ maxWidth: '450px', width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
              <h3 className="modal-title">{t('dashboard.attendance.fullDayAbsence')}</h3>
              <div className="modal-body">
                {/* Student selector */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    {t('dashboard.attendance.selectStudent')} <span className="form-required-asterisk">*</span>
                  </label>
                  <Select value={fullDayStudentId ? String(fullDayStudentId) : ''} onValueChange={(v) => setFullDayStudentId(Number(v))}>
                    <SelectTrigger className="modal-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classStudents.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.surnames}, {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date picker */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    {t('dashboard.attendance.selectDate')} <span className="form-required-asterisk">*</span>
                  </label>
                  <input
                    type="date"
                    className="modal-input"
                    value={toInputDate(fullDayDate)}
                    onChange={(e) => setFullDayDate(fromInputDate(e.target.value))}
                  />
                </div>

                {/* Confirmation text */}
                {fullDayStudentId > 0 && (
                  <p style={{ fontSize: '0.875rem', color: '#3d4440', lineHeight: '1.5', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', marginTop: '0.5rem' }}>
                    {confirmMessage}
                  </p>
                )}
              </div>

              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button
                  className="modal-button cancel"
                  onClick={() => setShowFullDayModal(false)}
                  disabled={operatingFullDay}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="modal-button save"
                  onClick={handleFullDaySubmit}
                  disabled={operatingFullDay || !fullDayStudentId}
                >
                  {operatingFullDay && <Loader2 className="animate-spin" size={16} style={{ marginRight: '0.25rem' }} />}
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Error & Success Modals */}
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
    </div>
  );
}








