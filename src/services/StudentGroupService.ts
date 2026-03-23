import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';

/**
 * Member info within a saved group (as returned by the API)
 */
export interface GroupMember {
  /** Membership row ID */
  id: number;
  /** Student ID */
  studentId: number;
  /** Student first name */
  studentName: string;
  /** Student surnames */
  studentSurnames: string;
}

/**
 * A persisted student group returned from the API
 */
export interface SavedGroup {
  id: number;
  classId: number;
  name: string;
  members: GroupMember[];
}

/**
 * DTO for creating or updating a group (id is optional for new groups)
 */
export interface SavedGroupRequest {
  id?: number;
  name: string;
  studentIds: number[];
}


/**
 * Service for managing cooperative student groups.
 * Extends BaseService for authentication and error handling.
 */
export class StudentGroupService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Get all saved (persisted) groups for a class.
   * GET /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   * @returns Array of saved groups with student details
   */
  static async getSavedGroups(classId: number): Promise<SavedGroup[]> {
    return this.get<SavedGroup[]>(this.BASE_ENDPOINT, `/classes/${classId}/saved-groups`);
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
    const url = `${apiUrl}${this.BASE_ENDPOINT}/classes/${classId}/saved-groups`;

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
   * Update all saved groups for a class (full replace).
   * Groups with id are updated, groups without id are created,
   * existing groups not in the request are deleted.
   * PATCH /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   * @param groups - Array of group data to save
   */
  static async updateSavedGroups(classId: number, groups: SavedGroupRequest[]): Promise<void> {
    return this.patch<void>(this.BASE_ENDPOINT, `/classes/${classId}/saved-groups`, groups);
  }

  /**
   * Delete all saved groups for a class.
   * DELETE /teacher-notebook/v1/classes/:classId/saved-groups
   * @param classId - Class ID
   */
  static async deleteSavedGroups(classId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/classes/${classId}/saved-groups`);
  }

  /**
   * Generate balanced student groups automatically (not persisted).
   * GET /teacher-notebook/v1/classes/:classId/student-groups?prioritizeShapeDiversity=...
   * @param classId - Class ID
   * @param prioritizeShapeDiversity - true to prioritize shape, false for gender
   * @returns Array of arrays of student IDs (each inner array is one group)
   */
  static async generateGroups(classId: number, prioritizeShapeDiversity: boolean): Promise<number[][]> {
    return this.get<number[][]>(
      this.BASE_ENDPOINT,
      `/classes/${classId}/student-groups?prioritizeShapeDiversity=${prioritizeShapeDiversity}`
    );
  }
}

