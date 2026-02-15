import { BaseService } from './BaseService';

/**
 * Interface representing a Subject entity
 */
export interface Subject {
  id: number;
  name: string;
}

/**
 * Interface for subject creation/update request
 */
export interface SubjectRequestDTO {
  name: string;
}

/**
 * Service for managing subjects
 * Provides CRUD operations for subjects
 */
export class SubjectService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Get all subjects
   * GET /teacher-notebook/v1/subjects
   * @returns Array of subjects
   */
  static async getSubjects(): Promise<Subject[]> {
    return this.get<Subject[]>(this.BASE_ENDPOINT, '/subjects');
  }

  /**
   * Create a new subject
   * PUT /teacher-notebook/v1/subjects
   * @param name - Name of the subject
   * @returns Created subject
   */
  static async createSubject(name: string): Promise<Subject> {
    const requestBody: SubjectRequestDTO = { name };
    return this.put<Subject>(this.BASE_ENDPOINT, '/subjects', requestBody);
  }

  /**
   * Update an existing subject
   * PATCH /teacher-notebook/v1/subjects/:subjectId
   * @param subjectId - ID of the subject to update
   * @param name - New name for the subject
   * @returns Updated subject
   */
  static async updateSubject(subjectId: number, name: string): Promise<Subject> {
    const requestBody: SubjectRequestDTO = { name };
    return this.patch<Subject>(this.BASE_ENDPOINT, `/subjects/${subjectId}`, requestBody);
  }

  /**
   * Delete a subject
   * DELETE /teacher-notebook/v1/subjects/:subjectId
   * @param subjectId - ID of the subject to delete
   */
  static async deleteSubject(subjectId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/subjects/${subjectId}`);
  }

  /**
   * Get subjects assigned to a specific class
   * GET /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - ID of the class
   * @returns Array of subjects assigned to the class
   */
  static async getSubjectsByClass(classId: number): Promise<Subject[]> {
    return this.get<Subject[]>(this.BASE_ENDPOINT, `/classes/${classId}/subjects`);
  }
}

