import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';

/**
 * Interface representing an absence record
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
 * DTO for creating an absence
 * If subjectId is omitted, the backend creates absences for ALL subjects of the day.
 */
export interface AbsenceCreateRequest {
  studentId: number;
  date: string; // DD/MM/YYYY
  subjectId?: number;
}

/**
 * Service for managing student absences.
 * Extends BaseService for authentication and error handling.
 */
export class AbsenceService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Get all absences for a class (no filters).
   * GET /teacher-notebook/v1/classes/:classId/absences
   * @param classId - Class ID
   * @returns Array of absences
   */
  static async getAllAbsences(classId: number): Promise<Absence[]> {
    return this.get<Absence[]>(this.BASE_ENDPOINT, `/classes/${classId}/absences`);
  }

  /**
   * Get all absences for a specific student in a class.
   * GET /teacher-notebook/v1/classes/:classId/absences?studentId=:studentId
   * @param classId - Class ID
   * @param studentId - Student ID
   * @returns Array of absences for the student
   */
  static async getStudentAbsences(classId: number, studentId: number): Promise<Absence[]> {
    return this.get<Absence[]>(this.BASE_ENDPOINT, `/classes/${classId}/absences?studentId=${studentId}`);
  }

  /**
   * Create an absence record.
   * POST /teacher-notebook/v1/classes/:classId/absences
   * If body.subjectId is omitted, absence is created for all subjects of the day.
   * @param classId - Class ID
   * @param body - Absence creation data
   */
  static async createAbsence(classId: number, body: AbsenceCreateRequest): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/classes/${classId}/absences`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Delete a single absence by its ID.
   * DELETE /teacher-notebook/v1/absences/:id
   * @param absenceId - Absence ID
   */
  static async deleteAbsenceById(absenceId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/absences/${absenceId}`);
  }

  /**
   * Delete all absences for a student on a specific date in a class.
   * DELETE /teacher-notebook/v1/classes/:classId/absences?studentId=&date=
   * @param classId - Class ID
   * @param studentId - Student ID
   * @param date - Date in DD/MM/YYYY format
   */
  static async deleteAbsencesByStudentAndDate(
    classId: number,
    studentId: number,
    date: string
  ): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const params = new URLSearchParams({
      studentId: String(studentId),
      date,
    });
    const url = `${apiUrl}${this.BASE_ENDPOINT}/classes/${classId}/absences?${params.toString()}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }
}

