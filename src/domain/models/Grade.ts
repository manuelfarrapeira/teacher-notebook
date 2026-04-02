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
 * Exercise grade (within student grades)
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
 * Subject with exercise grades (within a student quarter)
 */
export interface GradeSubject {
  subjectId: number;
  subjectName: string;
  exercises: GradeExercise[];
}

/**
 * Student quarter data
 */
export interface StudentQuarter {
  quarter: number;
  subjects: GradeSubject[];
}

/**
 * Complete grade data for a student
 */
export interface StudentGrades {
  studentId: number;
  studentName: string;
  studentSurnames: string;
  quarters: StudentQuarter[];
}

/**
 * DTO for creating a grade
 */
export interface GradeCreateRequest {
  studentId: number;
  grade: number;
  description: string;
}

/**
 * DTO for updating a grade
 */
export interface GradeUpdateRequest {
  grade: number;
  description: string;
}
