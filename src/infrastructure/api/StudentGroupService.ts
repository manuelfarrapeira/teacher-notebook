import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { SavedGroup, SavedGroupRequest } from '../../domain/models';

/**
 * Service for cooperative student group management.
 * Extends BaseService for authentication and error handling.
 */
export class StudentGroupService extends BaseService {

  /**
   * Get all saved (persisted) groups for a class.
   * GET /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   * @returns Array of saved groups with student details
   */
  static async getSavedGroups(classId: number): Promise<SavedGroup[]> {
    return this.get<SavedGroup[]>(BASE_ENDPOINT_V1, `/classes/${classId}/saved-groups`);
  }

  /**
   * Create new saved groups for a class.
   * POST /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   * @param groups - Array of group data to create
   */
  static async createSavedGroups(classId: number, groups: SavedGroupRequest[]): Promise<void> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/classes/${classId}/saved-groups`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(groups),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }

  /**
   * Update all saved groups for a class (full replacement).
   * Groups with id are updated, groups without id are created,
   * existing groups not present are deleted.
   * PATCH /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   * @param groups - Array of group data to save
   */
  static async updateSavedGroups(classId: number, groups: SavedGroupRequest[]): Promise<void> {
    return this.patch<void>(BASE_ENDPOINT_V1, `/classes/${classId}/saved-groups`, groups);
  }

  /**
   * Delete all saved groups for a class.
   * DELETE /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   */
  static async deleteSavedGroups(classId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/classes/${classId}/saved-groups`);
  }

  /**
   * Generate balanced student groups automatically (not persisted).
   * GET /teacher-notebook/v1/classes/:classId/student-groups?prioritizeShapeDiversity=...
   * @param classId - Class ID
   * @param prioritizeShapeDiversity - true to prioritize shape, false for gender
   * @returns Array of arrays of student IDs (each inner array is a group)
   */
  static async generateGroups(classId: number, prioritizeShapeDiversity: boolean): Promise<number[][]> {
    return this.get<number[][]>(
      BASE_ENDPOINT_V1,
      `/classes/${classId}/student-groups?prioritizeShapeDiversity=${prioritizeShapeDiversity}`
    );
  }
}

// Re-export domain types for backward compatibility
export type { GroupMember, SavedGroup, SavedGroupRequest } from '../../domain/models';
