/**
 * Domain entity representing an absence record
 */
export interface Absence {
  id: number;
  studentId: number;
  studentName: string;
  studentSurnames: string;
  classId: number;
  subjectId: number;
  subjectName: string;
  absenceDate: string; // DD/MM/YYYY
}

/**
 * DTO for creating an absence.
 * If subjectId is omitted, the backend creates absences for ALL subjects of the day.
 */
export interface AbsenceCreateRequest {
  studentId: number;
  date: string; // DD/MM/YYYY
  subjectId?: number;
}
