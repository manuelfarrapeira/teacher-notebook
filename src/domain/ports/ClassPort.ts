import type { SchoolClass, ClassRequestDTO } from '../models';

/**
 * Driven port for class operations.
 */
export interface ClassPort {
  createClass(schoolId: number, data: ClassRequestDTO): Promise<SchoolClass>;
  updateClass(classId: number, data: ClassRequestDTO): Promise<SchoolClass>;
  deleteClass(classId: number): Promise<void>;
}
