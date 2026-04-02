import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { Student, StudentRequestDTO } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { Gender, Shape, Student, StudentRequestDTO } from '../../domain/models';

/**
 * Service for student management.
 * Extends BaseService for authentication and error handling.
 */
export class StudentService extends BaseService {

  /**
   * Get all students for the authenticated teacher
   * GET /teacher-notebook/v1/students/all
   * @returns Array of students with their assigned classes
   */
  static async getStudents(): Promise<Student[]> {
    return this.get<Student[]>(BASE_ENDPOINT_V1, '/students/all');
  }

  /**
   * Create a new student
   * PUT /teacher-notebook/v1/students
   * @param studentData - Student data to create
   * @returns Created student
   */
  static async createStudent(studentData: StudentRequestDTO): Promise<Student> {
    return this.put<Student>(BASE_ENDPOINT_V1, '/students', studentData);
  }

  /**
   * Update an existing student
   * PATCH /teacher-notebook/v1/students/:id
   * @param id - Student ID
   * @param studentData - Updated student data
   * @returns Updated student
   */
  static async updateStudent(id: number, studentData: StudentRequestDTO): Promise<Student> {
    return this.patch<Student>(BASE_ENDPOINT_V1, `/students/${id}`, studentData);
  }

  /**
   * Get the photo URL for a student.
   * Does not make a fetch request, only builds the URL.
   * @param studentId - Student ID
   * @returns Photo URL
   */
  static getPhotoUrl(studentId: number): string {
    const apiUrl = getApiUrl();
    return `${apiUrl}${BASE_ENDPOINT_V1}/students/${studentId}/photo`;
  }

  /**
   * Upload a student photo
   * POST /teacher-notebook/v1/students/:id/photo
   * @param studentId - Student ID
   * @param file - Image file (JPEG/PNG)
   */
  static async uploadPhoto(studentId: number, file: File): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/students/${studentId}/photo`;

    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Delete a student photo
   * DELETE /teacher-notebook/v1/students/:id/photo
   * @param studentId - Student ID
   */
  static async deletePhoto(studentId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/students/${studentId}/photo`);
  }

  /**
   * Delete a student
   * DELETE /teacher-notebook/v1/students/:id
   * @param studentId - Student ID
   */
  static async deleteStudent(studentId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/students/${studentId}`);
  }

  /**
   * Assign a student to a class
   * PUT /teacher-notebook/v1/classes/:classId/students/:studentId
   * @param classId - Class ID
   * @param studentId - Student ID
   */
  static async assignToClass(classId: number, studentId: number): Promise<void> {
    return this.put<void>(BASE_ENDPOINT_V1, `/classes/${classId}/students/${studentId}`);
  }

  /**
   * Remove a student from a class
   * DELETE /teacher-notebook/v1/classes/:classId/students/:studentId
   * @param classId - Class ID
   * @param studentId - Student ID
   */
  static async removeFromClass(classId: number, studentId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/classes/${classId}/students/${studentId}`);
  }

  /**
   * Helper to get the token from AuthService
   * @private
   */
  private static getToken(): string {
    const token = AuthService.getAccessToken();
    if (!token) {
      throw new Error('No access token found');
    }
    return token;
  }
}
