import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { SchoolClass, ClassRequestDTO } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { ClassRequestDTO } from '../../domain/models';

export class ClassService extends BaseService {

  /**
   * Create a new class for a school
   * PUT /teacher-notebook/v1/school/:schoolId/classes
   * @param schoolId - School ID
   * @param classData - Class data to create
   * @returns Created class
   */
  static async createClass(schoolId: number, classData: ClassRequestDTO): Promise<SchoolClass> {
    return this.put<SchoolClass>(BASE_ENDPOINT_V1, `/school/${schoolId}/classes`, classData);
  }

  /**
   * Update an existing class
   * PATCH /teacher-notebook/v1/classes/:classId
   * @param classId - Class ID to update
   * @param classData - Updated class data
   * @returns Updated class
   */
  static async updateClass(classId: number, classData: ClassRequestDTO): Promise<SchoolClass> {
    return this.patch<SchoolClass>(BASE_ENDPOINT_V1, `/classes/${classId}`, classData);
  }

  /**
   * Delete a class
   * DELETE /teacher-notebook/v1/classes/:classId
   * @param classId - Class ID to delete
   */
  static async deleteClass(classId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/classes/${classId}`);
  }
}
