/**
 * Student gender type
 */
export type Gender = 'M' | 'F';

/**
 * Student shape type (optional visual identifier)
 */
export type Shape = 'SQUARE' | 'CIRCLE' | 'TRIANGLE';

/**
 * Domain entity representing a student
 */
export interface Student {
  id: number;
  name: string;
  surnames: string;
  dateOfBirth: string; // DD/MM/YYYY
  additionalInfo: string;
  gender: Gender;
  photo: string | null;
  classIds: number[];
  shape?: Shape;
}

/**
 * DTO for creating or updating a student
 */
export interface StudentRequestDTO {
  name: string;
  surnames: string;
  dateOfBirth: string; // DD/MM/YYYY
  additionalInfo?: string;
  gender: Gender;
  shape?: Shape;
}
