import { BaseService } from './BaseService';
import { SchoolClass } from './SchoolService';

export interface ClassRequestDTO {
  name: string;
  schoolYear: string;
}

export class ClassService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Create a new class for a specific school
   * PUT /teacher-notebook/v1/school/:schoolId/classes
   * @param schoolId - ID of the school
   * @param classData - Class data to create
   * @returns Created class
   */
  static async createClass(schoolId: number, classData: ClassRequestDTO): Promise<SchoolClass> {
    return this.put<SchoolClass>(this.BASE_ENDPOINT, `/school/${schoolId}/classes`, classData);
  }

  /**
   * Update an existing class
   * PATCH /teacher-notebook/v1/classes/:classId
   * @param classId - ID of the class to update
   * @param classData - Updated class data
   * @returns Updated class
   */
  static async updateClass(classId: number, classData: ClassRequestDTO): Promise<SchoolClass> {
    return this.patch<SchoolClass>(this.BASE_ENDPOINT, `/classes/${classId}`, classData);
  }

  /**
   * Delete a class
   * DELETE /teacher-notebook/v1/classes/:classId
   * @param classId - ID of the class to delete
   */
  static async deleteClass(classId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/classes/${classId}`);
  }
}

