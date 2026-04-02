import type { Absence, AbsenceCreateRequest } from '../models';

/**
 * Driven port for absence operations.
 */
export interface AbsencePort {
  getAllAbsences(classId: number): Promise<Absence[]>;
  getStudentAbsences(classId: number, studentId: number): Promise<Absence[]>;
  createAbsence(classId: number, body: AbsenceCreateRequest): Promise<void>;
  deleteAbsenceById(absenceId: number): Promise<void>;
  deleteAbsencesByStudentAndDate(classId: number, studentId: number, date: string): Promise<void>;
}
