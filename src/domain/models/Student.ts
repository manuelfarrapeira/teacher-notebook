/**
 * Student gender type
 */
export type Gender = 'M' | 'F';

/**
 * Student shape type (optional visual identifier)
 */
export type Shape = 'SQUARE' | 'CIRCLE' | 'TRIANGLE';

/**
 * Class information within a school (informative)
 */
export interface ClassInfo {
  className: string;
}

/**
 * School information with associated classes (informative)
 */
export interface SchoolClassInfo {
  schoolName: string;
  classes: ClassInfo[];
}

/**
 * Domain entity representing a student
 */
export interface Student {
  id: number;
  name: string;
  surnames: string;
  dateOfBirth?: string; // DD/MM/YYYY - optional
  additionalInfo: string;
  gender: Gender;
  photo: string | null;
  classIds: number[];
  classNumber?: number | null; // Class number (optional)
  shape?: Shape;
  classList?: SchoolClassInfo[]; // Informative: schools and classes the student belongs to
}

/**
 * DTO for creating or updating a student
 */
export interface StudentRequestDTO {
  name: string;
  surnames: string;
  dateOfBirth?: string; // DD/MM/YYYY - optional
  additionalInfo?: string;
  gender: Gender;
  shape?: Shape;
  classNumber?: number | null;
}
