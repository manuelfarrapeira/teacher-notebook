import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { Absence, AbsenceCreateRequest } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { Absence, AbsenceCreateRequest } from '../../domain/models';

/**
 * Service for absence management.
 * Extends BaseService for authentication and error handling.
 */
export class AbsenceService extends BaseService {

  /**
   * Get all absences for a class (no filters).
   * GET /teacher-notebook/v1/classes/:classId/absences
   * @param classId - Class ID
   * @returns Array of absences
   */
  static async getAllAbsences(classId: number): Promise<Absence[]> {
    return this.get<Absence[]>(BASE_ENDPOINT_V1, `/classes/${classId}/absences`);
  }

  /**
   * Get all absences for a specific student in a class.
   * GET /teacher-notebook/v1/classes/:classId/absences?studentId=:studentId
   * @param classId - Class ID
   * @param studentId - Student ID
   * @returns Array of student absences
   */
  static async getStudentAbsences(classId: number, studentId: number): Promise<Absence[]> {
    return this.get<Absence[]>(BASE_ENDPOINT_V1, `/classes/${classId}/absences?studentId=${studentId}`);
  }

  /**
   * Create an absence record.
   * POST /teacher-notebook/v1/classes/:classId/absences
   * If body.subjectId is omitted, creates absences for all subjects of the day.
   * @param classId - Class ID
   * @param body - Absence creation data
   */
  static async createAbsence(classId: number, body: AbsenceCreateRequest): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/classes/${classId}/absences`;

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
   * Delete an absence by its ID.
   * DELETE /teacher-notebook/v1/absences/:id
   * @param absenceId - Absence ID
   */
  static async deleteAbsenceById(absenceId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/absences/${absenceId}`);
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
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/classes/${classId}/absences?${params.toString()}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }
}
