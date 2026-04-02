import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import type { ClassRubric, StudentCriteriaGroup } from '../../domain/models';
import { BASE_ENDPOINT_V1 } from './endpoints';

// Re-export domain types for backward compatibility
export type {
  ClassRubricCriterion,
  ClassRubric,
  StudentCriterionAssignment,
  StudentCriteriaGroup,
} from '../../domain/models';

/**
 * Service for class rubric and student criteria management.
 */
export class ClassRubricService extends BaseService {

  // ========================
  // Class-Rubric endpoints
  // ========================

  /**
   * Get all rubrics assigned to a class (with their criteria).
   * GET /teacher-notebook/v1/classes/:classId/rubrics
   * @param classId - Class ID
   * @returns Array of class rubrics
   */
  static async getClassRubrics(classId: number): Promise<ClassRubric[]> {
    return this.get<ClassRubric[]>(BASE_ENDPOINT_V1, `/classes/${classId}/rubrics`);
  }

  /**
   * Assign a rubric to a class.
   * POST /teacher-notebook/v1/classes/:classId/rubrics
   * @param classId - Class ID
   * @param rubricId - Rubric ID to assign
   */
  static async assignRubricToClass(classId: number, rubricId: number): Promise<void> {
    this.validateToken();
    const apiUrl = getApiUrl();
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/classes/${classId}/rubrics`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ rubricId }),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Remove a rubric assignment from a class (soft delete, cascades to criteria).
   * DELETE /teacher-notebook/v1/class-rubrics/:classRubricId
   * @param classRubricId - Class-rubric assignment ID
   */
  static async removeRubricFromClass(classRubricId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/class-rubrics/${classRubricId}`);
  }

  // ========================
  // Student-Criteria endpoints
  // ========================

  /**
   * Get all student criteria assignments for a class.
   * GET /teacher-notebook/v1/classes/:classId/rubric-criteria
   * @param classId - Class ID
   * @returns Array of student criteria groups
   */
  static async getAllStudentCriteria(classId: number): Promise<StudentCriteriaGroup[]> {
    return this.get<StudentCriteriaGroup[]>(BASE_ENDPOINT_V1, `/classes/${classId}/rubric-criteria`);
  }

  /**
   * Get criteria assignments for a specific student in a class.
   * GET /teacher-notebook/v1/classes/:classId/students/:studentId/rubric-criteria
   * @param classId - Class ID
   * @param studentId - Student ID
   * @returns Array of student criteria groups
   */
  static async getStudentCriteria(classId: number, studentId: number): Promise<StudentCriteriaGroup[]> {
    return this.get<StudentCriteriaGroup[]>(
      BASE_ENDPOINT_V1,
      `/classes/${classId}/students/${studentId}/rubric-criteria`,
    );
  }

  /**
   * Assign a criterion to a student within a class rubric.
   * POST /teacher-notebook/v1/class-rubrics/:classRubricId/students/:studentId/criteria
   * @param classRubricId - Class-rubric assignment ID
   * @param studentId - Student ID
   * @param criterionId - Criterion ID to assign
   */
  static async assignCriterionToStudent(
    classRubricId: number,
    studentId: number,
    criterionId: number,
  ): Promise<void> {
    this.validateToken();
    const apiUrl = getApiUrl();
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/class-rubrics/${classRubricId}/students/${studentId}/criteria`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ criterionId }),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Update the criterion assigned to a student.
   * PUT /teacher-notebook/v1/student-criteria/:id
   * @param studentCriterionId - Student-criterion assignment ID
   * @param criterionId - New criterion ID
   */
  static async updateStudentCriterion(studentCriterionId: number, criterionId: number): Promise<void> {
    return this.put<void>(BASE_ENDPOINT_V1, `/student-criteria/${studentCriterionId}`, { criterionId });
  }

  /**
   * Remove a criterion assignment from a student (soft delete).
   * DELETE /teacher-notebook/v1/student-criteria/:id
   * @param studentCriterionId - Student-criterion assignment ID
   */
  static async removeStudentCriterion(studentCriterionId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/student-criteria/${studentCriterionId}`);
  }
}
