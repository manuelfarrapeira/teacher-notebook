import type { School, SchoolRequestDTO } from '../models';

/**
 * Driven port for school operations.
 */
export interface SchoolPort {
  getSchools(): Promise<School[]>;
  createSchool(data: SchoolRequestDTO): Promise<School>;
  updateSchool(id: number, data: SchoolRequestDTO): Promise<School>;
  deleteSchool(id: number): Promise<void>;
}
