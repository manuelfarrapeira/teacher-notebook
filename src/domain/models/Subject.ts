/**
 * Domain entity representing a subject
 */
export interface Subject {
  id: number;
  name: string;
}

/**
 * Subject assigned to a class (API format with subjectClassId)
 */
export interface ClassSubject {
  subjectClassId: number;
  subjectId: number;
  subjectName: string;
}

/**
 * DTO for creating or updating a subject
 */
export interface SubjectRequestDTO {
  name: string;
}
