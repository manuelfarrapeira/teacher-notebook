import { BaseService } from './BaseService';

/**
 * Interface representing a Subject entity
 */
export interface Subject {
  id: number;
  name: string;
}

/**
 * Interface representing a subject assigned to a class (new API format)
 */
export interface ClassSubject {
  subjectClassId: number;
  subjectId: number;
  subjectName: string;
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
   * Get subjects assigned to a specific class (new API format with subjectClassId)
   * GET /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - ID of the class
   * @returns Array of ClassSubject with subjectClassId, subjectId and subjectName
   */
  static async getClassSubjects(classId: number): Promise<ClassSubject[]> {
    return this.get<ClassSubject[]>(this.BASE_ENDPOINT, `/classes/${classId}/subjects`);
  }

  /**
   * Get subjects assigned to a specific class mapped to Subject format (backward compatibility)
   * @param classId - ID of the class
   * @returns Array of subjects mapped from ClassSubject format
   */
  static async getSubjectsByClass(classId: number): Promise<Subject[]> {
    const classSubjects = await this.getClassSubjects(classId);
    return classSubjects.map(cs => ({ id: cs.subjectId, name: cs.subjectName }));
  }

  /**
   * Assign subjects to a class
   * PUT /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - ID of the class
   * @param subjectIds - Array of subject IDs to assign
   */
  static async assignSubjectsToClass(classId: number, subjectIds: number[]): Promise<void> {
    return this.put<void>(this.BASE_ENDPOINT, `/classes/${classId}/subjects`, { subjectIds });
  }

  /**
   * Remove subjects from a class
   * DELETE /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - ID of the class
   * @param subjectIds - Array of subject IDs to remove
   */
  static async removeSubjectsFromClass(classId: number, subjectIds: number[]): Promise<void> {
    return this.deleteWithBody<void>(this.BASE_ENDPOINT, `/classes/${classId}/subjects`, { subjectIds });
  }
}

