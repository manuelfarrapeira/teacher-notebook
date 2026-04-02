import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { Subject, ClassSubject, SubjectRequestDTO } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { Subject, ClassSubject, SubjectRequestDTO } from '../../domain/models';

/**
 * Service for subject management.
 * CRUD operations and class assignment.
 */
export class SubjectService extends BaseService {

  /**
   * Get all subjects.
   * GET /teacher-notebook/v1/subjects
   * @returns Array of subjects
   */
  static async getSubjects(): Promise<Subject[]> {
    return this.get<Subject[]>(BASE_ENDPOINT_V1, '/subjects');
  }

  /**
   * Create a new subject.
   * PUT /teacher-notebook/v1/subjects
   * @param name - Subject name
   * @returns Created subject
   */
  static async createSubject(name: string): Promise<Subject> {
    const requestBody: SubjectRequestDTO = { name };
    return this.put<Subject>(BASE_ENDPOINT_V1, '/subjects', requestBody);
  }

  /**
   * Update an existing subject.
   * PATCH /teacher-notebook/v1/subjects/:subjectId
   * @param subjectId - Subject ID
   * @param name - New name
   * @returns Updated subject
   */
  static async updateSubject(subjectId: number, name: string): Promise<Subject> {
    const requestBody: SubjectRequestDTO = { name };
    return this.patch<Subject>(BASE_ENDPOINT_V1, `/subjects/${subjectId}`, requestBody);
  }

  /**
   * Delete a subject.
   * DELETE /teacher-notebook/v1/subjects/:subjectId
   * @param subjectId - Subject ID
   */
  static async deleteSubject(subjectId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/subjects/${subjectId}`);
  }

  /**
   * Get subjects assigned to a class (format with subjectClassId).
   * GET /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - Class ID
   * @returns Array of ClassSubject with subjectClassId, subjectId and subjectName
   */
  static async getClassSubjects(classId: number): Promise<ClassSubject[]> {
    return this.get<ClassSubject[]>(BASE_ENDPOINT_V1, `/classes/${classId}/subjects`);
  }

  /**
   * Get class subjects mapped to Subject format (compatibility)
   * @param classId - Class ID
   * @returns Array of subjects mapped from ClassSubject format
   */
  static async getSubjectsByClass(classId: number): Promise<Subject[]> {
    const classSubjects = await this.getClassSubjects(classId);
    return classSubjects.map(cs => ({ id: cs.subjectId, name: cs.subjectName }));
  }

  /**
   * Assign subjects to a class.
   * PUT /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - Class ID
   * @param subjectIds - Array of subject IDs
   */
  static async assignSubjectsToClass(classId: number, subjectIds: number[]): Promise<void> {
    return this.put<void>(BASE_ENDPOINT_V1, `/classes/${classId}/subjects`, { subjectIds });
  }

  /**
   * Remove subjects from a class.
   * DELETE /teacher-notebook/v1/classes/:classId/subjects
   * @param classId - Class ID
   * @param subjectIds - Array of subject IDs
   */
  static async removeSubjectsFromClass(classId: number, subjectIds: number[]): Promise<void> {
    return this.deleteWithBody<void>(BASE_ENDPOINT_V1, `/classes/${classId}/subjects`, { subjectIds });
  }
}
