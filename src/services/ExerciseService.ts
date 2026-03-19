import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';
import { getCurrentLocale } from '../lib/i18n';

// ========================
// Exercise interfaces
// ========================

/**
 * Document attached to an exercise
 */
export interface ExerciseDocument {
  id: number;
  exerciseId: number;
  document: string;
  description: string;
}

/**
 * Exercise entity
 */
export interface Exercise {
  id: number;
  subjectClassId: number;
  title: string;
  description: string;
  percentageGrade: number;
  maxGrade: number;
  documents: ExerciseDocument[];
}

/**
 * Subject with its exercises (inside a quarter)
 */
export interface ExerciseSubject {
  subjectId: number;
  subjectName: string;
  exercises: Exercise[];
}

/**
 * Quarter with subjects and exercises
 */
export interface QuarterExercises {
  quarter: number;
  subjects: ExerciseSubject[];
}

/**
 * Request to create an exercise
 */
export interface ExerciseRequest {
  title: string;
  description: string;
  quarter: number;
  percentageGrade: number;
  maxGrade: number;
}

// ========================
// Grade interfaces
// ========================

/**
 * Document attached to a grade
 */
export interface GradeDocument {
  id: number;
  gradeId: number;
  document: string;
  description: string;
}

/**
 * Grade for an exercise (inside student grades)
 */
export interface GradeExercise {
  gradeId: number;
  exerciseId: number;
  exerciseTitle: string;
  maxGrade: number;
  percentageGrade: number;
  grade: number;
  description: string;
  documents: GradeDocument[];
}

/**
 * Subject with exercise grades (inside student quarter)
 */
export interface GradeSubject {
  subjectId: number;
  subjectName: string;
  exercises: GradeExercise[];
}

/**
 * Quarter data for a student
 */
export interface StudentQuarter {
  quarter: number;
  subjects: GradeSubject[];
}

/**
 * Full grade data for a student
 */
export interface StudentGrades {
  studentId: number;
  studentName: string;
  studentSurnames: string;
  quarters: StudentQuarter[];
}

/**
 * Request to create a grade
 */
export interface GradeCreateRequest {
  studentId: number;
  grade: number;
  description: string;
}

/**
 * Request to update a grade
 */
export interface GradeUpdateRequest {
  grade: number;
  description: string;
}

// ========================
// Service
// ========================

/**
 * Service for managing exercises, grades and exercise documents.
 * Extends BaseService for authentication and error handling.
 */
export class ExerciseService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  // ---------- Exercises ----------

  /**
   * Get all exercises for a class grouped by quarter and subject
   * GET /teacher-notebook/v1/classes/:classId/exercises
   * @param classId - Class ID
   * @returns Array of QuarterExercises
   */
  static async getExercises(classId: number): Promise<QuarterExercises[]> {
    return this.get<QuarterExercises[]>(this.BASE_ENDPOINT, `/classes/${classId}/exercises`);
  }

  /**
   * Create a new exercise for a subject-class
   * PUT /teacher-notebook/v1/subject-classes/:subjectClassId/exercises
   * @param subjectClassId - SubjectClass ID
   * @param data - Exercise data
   * @returns Created exercise
   */
  static async createExercise(subjectClassId: number, data: ExerciseRequest): Promise<Exercise> {
    return this.put<Exercise>(this.BASE_ENDPOINT, `/subject-classes/${subjectClassId}/exercises`, data);
  }

  /**
   * Delete an exercise
   * DELETE /teacher-notebook/v1/exercises/:id
   * @param exerciseId - Exercise ID
   */
  static async deleteExercise(exerciseId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/exercises/${exerciseId}`);
  }

  /**
   * Update an existing exercise
   * PATCH /teacher-notebook/v1/exercises/:exerciseId
   * @param exerciseId - Exercise ID
   * @param data - Updated exercise data
   * @returns Updated exercise
   */
  static async updateExercise(exerciseId: number, data: ExerciseRequest): Promise<Exercise> {
    return this.patch<Exercise>(this.BASE_ENDPOINT, `/exercises/${exerciseId}`, data);
  }

  // ---------- Grades ----------

  /**
   * Get all grades for a class grouped by student, quarter and subject
   * GET /teacher-notebook/v1/classes/:classId/grades
   * @param classId - Class ID
   * @returns Array of StudentGrades
   */
  static async getGrades(classId: number): Promise<StudentGrades[]> {
    return this.get<StudentGrades[]>(this.BASE_ENDPOINT, `/classes/${classId}/grades`);
  }

  /**
   * Get grades for a single student in a class
   * GET /teacher-notebook/v1/classes/:classId/students/:studentId/grades
   * @param classId - Class ID
   * @param studentId - Student ID
   * @returns Array of StudentQuarter (quarters with subjects and grades)
   */
  static async getStudentGrades(classId: number, studentId: number): Promise<StudentQuarter[]> {
    return this.get<StudentQuarter[]>(this.BASE_ENDPOINT, `/classes/${classId}/students/${studentId}/grades`);
  }

  /**
   * Create a grade for an exercise
   * PUT /teacher-notebook/v1/exercises/:exerciseId/grades
   * @param exerciseId - Exercise ID
   * @param data - Grade data including studentId
   */
  static async createGrade(exerciseId: number, data: GradeCreateRequest): Promise<void> {
    return this.put<void>(this.BASE_ENDPOINT, `/exercises/${exerciseId}/grades`, data);
  }

  /**
   * Update an existing grade
   * PATCH /teacher-notebook/v1/grades/:gradeId
   * @param gradeId - Grade ID
   * @param data - Updated grade data
   */
  static async updateGrade(gradeId: number, data: GradeUpdateRequest): Promise<void> {
    return this.patch<void>(this.BASE_ENDPOINT, `/grades/${gradeId}`, data);
  }

  /**
   * Delete a grade
   * DELETE /teacher-notebook/v1/grades/:gradeId
   * @param gradeId - Grade ID
   */
  static async deleteGrade(gradeId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/grades/${gradeId}`);
  }

  // ---------- Documents ----------

  /**
   * Upload a document for an exercise
   * POST /teacher-notebook/v1/exercises/:exerciseId/documents
   * @param exerciseId - Exercise ID
   * @param file - File to upload
   * @param description - Document description
   */
  static async uploadDocument(exerciseId: number, file: File, description: string): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/exercises/${exerciseId}/documents`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Download a document
   * GET /teacher-notebook/v1/exercises/:exerciseId/documents/:documentId/download
   * @param exerciseId - Exercise ID
   * @param documentId - Document ID
   * @returns Blob of the document
   */
  static async downloadDocument(exerciseId: number, documentId: number): Promise<Blob> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/exercises/${exerciseId}/documents/${documentId}/download`;

    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.blob();
  }

  /**
   * Update a document description
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
      this.BASE_ENDPOINT,
      `/exercises/${exerciseId}/documents/${documentId}`,
      { description }
    );
  }

  /**
   * Delete a document
   * DELETE /teacher-notebook/v1/exercises/:exerciseId/documents/:documentId
   * @param exerciseId - Exercise ID
   * @param documentId - Document ID
   */
  static async deleteDocument(exerciseId: number, documentId: number): Promise<void> {
    return this.delete<void>(
      this.BASE_ENDPOINT,
      `/exercises/${exerciseId}/documents/${documentId}`
    );
  }

  // ---------- Grade Documents ----------

  /**
   * Upload a document for a grade
   * POST /teacher-notebook/v1/grades/:gradeId/documents
   * @param gradeId - Grade ID
   * @param file - File to upload
   * @param description - Document description
   */
  static async uploadGradeDocument(gradeId: number, file: File, description: string): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/grades/${gradeId}/documents`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Download a grade document
   * GET /teacher-notebook/v1/grades/:gradeId/documents/:documentId
   * @param gradeId - Grade ID
   * @param documentId - Document ID
   * @returns Blob of the document
   */
  static async downloadGradeDocument(gradeId: number, documentId: number): Promise<Blob> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/grades/${gradeId}/documents/${documentId}`;

    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.blob();
  }

  /**
   * Update a grade document description
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
      this.BASE_ENDPOINT,
      `/grades/${gradeId}/documents/${documentId}`,
      { description }
    );
  }

  /**
   * Delete a grade document
   * DELETE /teacher-notebook/v1/grades/:gradeId/documents/:documentId
   * @param gradeId - Grade ID
   * @param documentId - Document ID
   */
  static async deleteGradeDocument(gradeId: number, documentId: number): Promise<void> {
    return this.delete<void>(
      this.BASE_ENDPOINT,
      `/grades/${gradeId}/documents/${documentId}`
    );
  }

  // ---------- Export ----------

  /**
   * Export grades for a class as an Excel file
   * GET /teacher-notebook/v1/classes/:classId/grades/export
   * @param classId - Class ID
   * @returns Blob of the Excel file
   */
  static async exportGrades(classId: number): Promise<Blob> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/classes/${classId}/grades/export`;

    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.blob();
  }
}

