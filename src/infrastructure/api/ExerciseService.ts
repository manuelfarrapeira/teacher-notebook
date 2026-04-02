import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type {
  Exercise, ExerciseRequest, ExerciseSubject, QuarterExercises,
  StudentGrades, StudentQuarter,
  GradeCreateRequest, GradeUpdateRequest
} from '../../domain/models';

// Re-export domain types for backward compatibility
export type {
  ExerciseDocument, Exercise, ExerciseSubject, QuarterExercises, ExerciseRequest,
  GradeDocument, GradeExercise, GradeSubject, StudentQuarter, StudentGrades,
  GradeCreateRequest, GradeUpdateRequest
} from '../../domain/models';

/**
 * Service for exercise, grade and document management.
 * Extends BaseService for authentication and error handling.
 */
export class ExerciseService extends BaseService {

  // ---------- Exercises ----------

  /**
   * Get all exercises for a class grouped by quarter and subject.
   * GET /teacher-notebook/v1/classes/:classId/exercises
   * @param classId - Class ID
   * @returns Array of QuarterExercises
   */
  static async getExercises(classId: number): Promise<QuarterExercises[]> {
    return this.get<QuarterExercises[]>(BASE_ENDPOINT_V1, `/classes/${classId}/exercises`);
  }

  /**
   * Create a new exercise for a subject-class.
   * PUT /teacher-notebook/v1/subject-classes/:subjectClassId/exercises
   * @param subjectClassId - SubjectClass ID
   * @param data - Exercise data
   * @returns Created exercise
   */
  static async createExercise(subjectClassId: number, data: ExerciseRequest): Promise<Exercise> {
    return this.put<Exercise>(BASE_ENDPOINT_V1, `/subject-classes/${subjectClassId}/exercises`, data);
  }

  /**
   * Delete an exercise.
   * DELETE /teacher-notebook/v1/exercises/:id
   * @param exerciseId - Exercise ID
   */
  static async deleteExercise(exerciseId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/exercises/${exerciseId}`);
  }

  /**
   * Update an existing exercise.
   * PATCH /teacher-notebook/v1/exercises/:exerciseId
   * @param exerciseId - Exercise ID
   * @param data - Updated exercise data
   * @returns Updated exercise
   */
  static async updateExercise(exerciseId: number, data: ExerciseRequest): Promise<Exercise> {
    return this.patch<Exercise>(BASE_ENDPOINT_V1, `/exercises/${exerciseId}`, data);
  }

  // ---------- Grades ----------

  /**
   * Get all grades for a class grouped by student, quarter and subject.
   * GET /teacher-notebook/v1/classes/:classId/grades
   * @param classId - Class ID
   * @returns Array of StudentGrades
   */
  static async getGrades(classId: number): Promise<StudentGrades[]> {
    return this.get<StudentGrades[]>(BASE_ENDPOINT_V1, `/classes/${classId}/grades`);
  }

  /**
   * Get grades for a student in a class.
   * GET /teacher-notebook/v1/classes/:classId/students/:studentId/grades
   * @param classId - Class ID
   * @param studentId - Student ID
   * @returns Array of StudentQuarter (quarters with subjects and grades)
   */
  static async getStudentGrades(classId: number, studentId: number): Promise<StudentQuarter[]> {
    return this.get<StudentQuarter[]>(BASE_ENDPOINT_V1, `/classes/${classId}/students/${studentId}/grades`);
  }

  /**
   * Create a grade for an exercise.
   * PUT /teacher-notebook/v1/exercises/:exerciseId/grades
   * @param exerciseId - Exercise ID
   * @param data - Grade data including studentId
   */
  static async createGrade(exerciseId: number, data: GradeCreateRequest): Promise<void> {
    return this.put<void>(BASE_ENDPOINT_V1, `/exercises/${exerciseId}/grades`, data);
  }

  /**
   * Update an existing grade.
   * PATCH /teacher-notebook/v1/grades/:gradeId
   * @param gradeId - Grade ID
   * @param data - Updated grade data
   */
  static async updateGrade(gradeId: number, data: GradeUpdateRequest): Promise<void> {
    return this.patch<void>(BASE_ENDPOINT_V1, `/grades/${gradeId}`, data);
  }

  /**
   * Delete a grade.
   * DELETE /teacher-notebook/v1/grades/:gradeId
   * @param gradeId - Grade ID
   */
  static async deleteGrade(gradeId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/grades/${gradeId}`);
  }

  // ---------- Exercise documents ----------

  /**
   * Upload a document for an exercise.
   * POST /teacher-notebook/v1/exercises/:exerciseId/documents
   * @param exerciseId - Exercise ID
   * @param file - File to upload
   * @param description - Document description
   */
  static async uploadDocument(exerciseId: number, file: File, description: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return this.postFormData<void>(BASE_ENDPOINT_V1, `/exercises/${exerciseId}/documents`, formData);
  }

  /**
   * Download a document.
   * GET /teacher-notebook/v1/exercises/:exerciseId/documents/:documentId/download
   * @param exerciseId - Exercise ID
   * @param documentId - Document ID
   * @returns Document blob
   */
  static async downloadDocument(exerciseId: number, documentId: number): Promise<Blob> {
    return this.getBlob(BASE_ENDPOINT_V1, `/exercises/${exerciseId}/documents/${documentId}/download`);
  }

  /**
   * Update a document description.
   * PATCH /teacher-notebook/v1/exercises/:exerciseId/documents/:documentId
   * @param exerciseId - Exercise ID
   * @param documentId - Document ID
   * @param description - New description
   */
  static async updateDocumentDescription(
    exerciseId: number,
    documentId: number,
    description: string
  ): Promise<void> {
    return this.patch<void>(
      BASE_ENDPOINT_V1,
      `/exercises/${exerciseId}/documents/${documentId}`,
      { description }
    );
  }

  /**
   * Delete a document.
   * DELETE /teacher-notebook/v1/exercises/:exerciseId/documents/:documentId
   * @param exerciseId - Exercise ID
   * @param documentId - Document ID
   */
  static async deleteDocument(exerciseId: number, documentId: number): Promise<void> {
    return this.delete<void>(
      BASE_ENDPOINT_V1,
      `/exercises/${exerciseId}/documents/${documentId}`
    );
  }

  // ---------- Grade documents ----------

  /**
   * Upload a document for a grade.
   * POST /teacher-notebook/v1/grades/:gradeId/documents
   * @param gradeId - Grade ID
   * @param file - File to upload
   * @param description - Document description
   */
  static async uploadGradeDocument(gradeId: number, file: File, description: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return this.postFormData<void>(BASE_ENDPOINT_V1, `/grades/${gradeId}/documents`, formData);
  }

  /**
   * Download a grade document.
   * GET /teacher-notebook/v1/grades/:gradeId/documents/:documentId
   * @param gradeId - Grade ID
   * @param documentId - Document ID
   * @returns Document blob
   */
  static async downloadGradeDocument(gradeId: number, documentId: number): Promise<Blob> {
    return this.getBlob(BASE_ENDPOINT_V1, `/grades/${gradeId}/documents/${documentId}`);
  }

  /**
   * Update a grade document description.
   * PATCH /teacher-notebook/v1/grades/:gradeId/documents/:documentId
   * @param gradeId - Grade ID
   * @param documentId - Document ID
   * @param description - New description
   */
  static async updateGradeDocumentDescription(
    gradeId: number,
    documentId: number,
    description: string
  ): Promise<void> {
    return this.patch<void>(
      BASE_ENDPOINT_V1,
      `/grades/${gradeId}/documents/${documentId}`,
      { description }
    );
  }

  /**
   * Delete a grade document.
   * DELETE /teacher-notebook/v1/grades/:gradeId/documents/:documentId
   * @param gradeId - Grade ID
   * @param documentId - Document ID
   */
  static async deleteGradeDocument(gradeId: number, documentId: number): Promise<void> {
    return this.delete<void>(
      BASE_ENDPOINT_V1,
      `/grades/${gradeId}/documents/${documentId}`
    );
  }

  // ---------- Export ----------

  /**
   * Export class grades as an Excel file.
   * GET /teacher-notebook/v1/classes/:classId/grades/export
   * @param classId - Class ID
   * @returns Excel file blob
   */
  static async exportGrades(classId: number): Promise<Blob> {
    return this.getBlob(BASE_ENDPOINT_V1, `/classes/${classId}/grades/export`);
  }
}

