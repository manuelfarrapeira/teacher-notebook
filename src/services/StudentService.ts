import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';

/**
 * Gender type for students
 */
export type Gender = 'M' | 'F';

/**
 * Interface representing a student
 */
export interface Student {
  id: number;
  name: string;
  surnames: string;
  dateOfBirth: string; // DD/MM/YYYY
  additionalInfo: string;
  gender: Gender;
  photo: string | null;
  classIds: number[];
}

/**
 * DTO for creating or updating a student
 */
export interface StudentRequestDTO {
  name: string;
  surnames: string;
  dateOfBirth: string; // DD/MM/YYYY
  additionalInfo?: string;
  gender: Gender;
}

/**
 * Service for managing students
 * Extends BaseService for authentication and error handling
 */
export class StudentService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Get all students of the current teacher
   * GET /teacher-notebook/v1/students/all
   * @returns Array of students with their assigned classes
   */
  static async getStudents(): Promise<Student[]> {
    return this.get<Student[]>(this.BASE_ENDPOINT, '/students/all');
  }

  /**
   * Create a new student
   * PUT /teacher-notebook/v1/students
   * @param studentData - Student data to create
   * @returns Created student
   */
  static async createStudent(studentData: StudentRequestDTO): Promise<Student> {
    return this.put<Student>(this.BASE_ENDPOINT, '/students', studentData);
  }

  /**
   * Update an existing student
   * PATCH /teacher-notebook/v1/students/:id
   * @param id - Student ID
   * @param studentData - Updated student data
   * @returns Updated student
   */
  static async updateStudent(id: number, studentData: StudentRequestDTO): Promise<Student> {
    return this.patch<Student>(this.BASE_ENDPOINT, `/students/${id}`, studentData);
  }

  /**
   * Get the URL for a student's photo
   * Does not make a fetch request, just builds the URL
   * @param studentId - Student ID
   * @returns URL string for the photo endpoint
   */
  static getPhotoUrl(studentId: number): string {
    const apiUrl = getApiUrl();
    return `${apiUrl}${this.BASE_ENDPOINT}/students/${studentId}/photo`;
  }

  /**
   * Upload a photo for a student
   * POST /teacher-notebook/v1/students/:id/photo
   * @param studentId - Student ID
   * @param file - Image file to upload (JPEG/PNG)
   */
  static async uploadPhoto(studentId: number, file: File): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/students/${studentId}/photo`;

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
   * Delete a student's photo
   * DELETE /teacher-notebook/v1/students/:id/photo
   * @param studentId - Student ID
   */
  static async deletePhoto(studentId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/students/${studentId}/photo`);
  }

  /**
   * Delete a student
   * DELETE /teacher-notebook/v1/students/:id
   * @param studentId - Student ID
   */
  static async deleteStudent(studentId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/students/${studentId}`);
  }

  /**
   * Assign a student to a class
   * PUT /teacher-notebook/v1/classes/:classId/students/:studentId
   * @param classId - Class ID
   * @param studentId - Student ID
   */
  static async assignToClass(classId: number, studentId: number): Promise<void> {
    return this.put<void>(this.BASE_ENDPOINT, `/classes/${classId}/students/${studentId}`);
  }

  /**
   * Remove a student from a class
   * DELETE /teacher-notebook/v1/classes/:classId/students/:studentId
   * @param classId - Class ID
   * @param studentId - Student ID
   */
  static async removeFromClass(classId: number, studentId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/classes/${classId}/students/${studentId}`);
  }

  /**
   * Helper to get token from AuthService
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
