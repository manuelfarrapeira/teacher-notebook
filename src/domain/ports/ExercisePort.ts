import type {
  Exercise, ExerciseRequest, QuarterExercises,
  StudentGrades, StudentQuarter,
  GradeCreateRequest, GradeUpdateRequest
} from '../models';

/**
 * Driven port for exercise, grade and document operations.
 */
export interface ExercisePort {
  // Exercises
  getExercises(classId: number): Promise<QuarterExercises[]>;
  createExercise(subjectClassId: number, data: ExerciseRequest): Promise<Exercise>;
  updateExercise(exerciseId: number, data: ExerciseRequest): Promise<Exercise>;
  deleteExercise(exerciseId: number): Promise<void>;

  // Grades
  getGrades(classId: number): Promise<StudentGrades[]>;
  getStudentGrades(classId: number, studentId: number): Promise<StudentQuarter[]>;
  createGrade(exerciseId: number, data: GradeCreateRequest): Promise<void>;
  updateGrade(gradeId: number, data: GradeUpdateRequest): Promise<void>;
  deleteGrade(gradeId: number): Promise<void>;

  // Exercise documents
  uploadDocument(exerciseId: number, file: File, description: string): Promise<void>;
  downloadDocument(exerciseId: number, documentId: number): Promise<Blob>;
  updateDocumentDescription(exerciseId: number, documentId: number, description: string): Promise<void>;
  deleteDocument(exerciseId: number, documentId: number): Promise<void>;

  // Grade documents
  uploadGradeDocument(gradeId: number, file: File, description: string): Promise<void>;
  downloadGradeDocument(gradeId: number, documentId: number): Promise<Blob>;
  updateGradeDocumentDescription(gradeId: number, documentId: number, description: string): Promise<void>;
  deleteGradeDocument(gradeId: number, documentId: number): Promise<void>;

  // Export
  exportGrades(classId: number): Promise<Blob>;
}
