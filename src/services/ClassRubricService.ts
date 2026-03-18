import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';

// ========================
// Interfaces
// ========================

/**
 * Criterion belonging to a class rubric
 */
export interface ClassRubricCriterion {
  id: number;
  description: string;
  gradeStart: number;
  gradeEnd: number;
}

/**
 * A rubric assigned to a class (returned by GET /classes/:classId/rubrics)
 */
export interface ClassRubric {
  /** classRubricId — used for assign/remove operations */
  id: number;
  classId: number;
  rubricId: number;
  rubricTitle: string;
  skillId: number;
  criteria: ClassRubricCriterion[];
}

/**
 * A single criterion assignment for a student within a class-rubric
 */
export interface StudentCriterionAssignment {
  /** studentCriterionId — used for update/remove */
  id: number;
  classRubricId: number;
  rubric: {
    id: number;
    title: string;
  };
  criterion: {
    id: number;
    description: string;
    gradeStart: number;
    gradeEnd: number;
  };
}

/**
 * A student with their criterion assignments (returned by rubric-criteria endpoints)
 */
export interface StudentCriteriaGroup {
  student: {
    id: number;
    name: string;
    surnames: string;
  };
  rubricCriteria: StudentCriterionAssignment[];
}

/**
 * Service for managing class rubrics and student criterion assignments.
 * Inherits from BaseService for authenticated HTTP calls.
 */
export class ClassRubricService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

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
    return this.get<ClassRubric[]>(this.BASE_ENDPOINT, `/classes/${classId}/rubrics`);
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
    const url = `${apiUrl}${this.BASE_ENDPOINT}/classes/${classId}/rubrics`;

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
   * Remove a rubric assignment from a class (soft delete, cascades to student criteria).
   * DELETE /teacher-notebook/v1/class-rubrics/:classRubricId
   * @param classRubricId - ID of the class-rubric assignment
   */
  static async removeRubricFromClass(classRubricId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/class-rubrics/${classRubricId}`);
  }

  // ========================
  // Student-Criteria endpoints
  // ========================

  /**
   * Get all student criterion assignments for a class.
   * GET /teacher-notebook/v1/classes/:classId/rubric-criteria
   * @param classId - Class ID
   * @returns Array of student criteria groups
   */
  static async getAllStudentCriteria(classId: number): Promise<StudentCriteriaGroup[]> {
    return this.get<StudentCriteriaGroup[]>(this.BASE_ENDPOINT, `/classes/${classId}/rubric-criteria`);
  }

  /**
   * Get criterion assignments for a specific student in a class.
   * GET /teacher-notebook/v1/classes/:classId/students/:studentId/rubric-criteria
   * @param classId - Class ID
   * @param studentId - Student ID
   * @returns Array of student criteria groups (the API returns an array)
   */
  static async getStudentCriteria(classId: number, studentId: number): Promise<StudentCriteriaGroup[]> {
    return this.get<StudentCriteriaGroup[]>(
      this.BASE_ENDPOINT,
      `/classes/${classId}/students/${studentId}/rubric-criteria`,
    );
  }

  /**
   * Assign a criterion to a student within a class-rubric.
   * POST /teacher-notebook/v1/class-rubrics/:classRubricId/students/:studentId/criteria
   * @param classRubricId - ID of the class-rubric assignment
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
    const url = `${apiUrl}${this.BASE_ENDPOINT}/class-rubrics/${classRubricId}/students/${studentId}/criteria`;

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
   * @param studentCriterionId - ID of the student-criterion assignment
   * @param criterionId - New criterion ID
   */
  static async updateStudentCriterion(studentCriterionId: number, criterionId: number): Promise<void> {
    return this.put<void>(this.BASE_ENDPOINT, `/student-criteria/${studentCriterionId}`, { criterionId });
  }

  /**
   * Remove a criterion assignment from a student (soft delete).
   * DELETE /teacher-notebook/v1/student-criteria/:id
   * @param studentCriterionId - ID of the student-criterion assignment
   */
  static async removeStudentCriterion(studentCriterionId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/student-criteria/${studentCriterionId}`);
  }
}

