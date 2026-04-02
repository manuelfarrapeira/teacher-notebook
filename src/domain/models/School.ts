/**
 * Domain entity representing a class within a school
 */
export interface SchoolClass {
  id: number;
  schoolId: number;
  name: string;
  schoolYear: string;
}

/**
 * Domain entity representing a school
 */
export interface School {
  id: number;
  name: string;
  town: string;
  tlf: number;
  classes: SchoolClass[];
}

/**
 * DTO for creating or updating a school
 */
export interface SchoolRequestDTO {
  name: string;
  town?: string;
  tlf?: number;
}
