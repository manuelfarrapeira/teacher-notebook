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
 * Domain entity representing an exercise
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
 * Subject with its exercises (within a quarter)
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
 * DTO for creating or updating an exercise
 */
export interface ExerciseRequest {
  title: string;
  description: string;
  quarter: number;
  percentageGrade: number;
  maxGrade: number;
}
