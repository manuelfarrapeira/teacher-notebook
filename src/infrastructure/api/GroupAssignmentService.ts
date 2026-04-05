import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type {
  GroupAssignment, GroupAssignmentRequest,
  GroupAssignmentGrade,
} from '../../domain/models';

// Re-export domain types for backward compatibility
export type {
  GroupAssignmentDocument, GroupAssignmentGrade,
  GroupAssignment, GroupAssignmentRequest,
} from '../../domain/models';

/**
 * Service for cooperative group assignment management.
 * Extends BaseService for authentication and error handling.
 */
export class GroupAssignmentService extends BaseService {

  // ---------- Assignments ----------

  /**
   * Get all group assignments for a class.
   * GET /classes/:classId/group-assignments
   * @param classId - Class ID
   * @returns Array of GroupAssignment
   */
  static async getByClass(classId: number): Promise<GroupAssignment[]> {
    return this.get<GroupAssignment[]>(BASE_ENDPOINT_V1, `/classes/${classId}/group-assignments`);
  }

  /**
   * Create a new group assignment for a class.
   * POST /classes/:classId/group-assignments
   * @param classId - Class ID
   * @param data - Assignment data
   * @returns Created assignment
   */
  static async create(classId: number, data: GroupAssignmentRequest): Promise<GroupAssignment> {
    return this.post<GroupAssignment>(BASE_ENDPOINT_V1, `/classes/${classId}/group-assignments`, data);
  }

  /**
   * Update an existing group assignment.
   * PATCH /group-assignments/:assignmentId
   * @param assignmentId - Assignment ID
   * @param data - Updated assignment data
   * @returns Updated assignment
   */
  static async update(assignmentId: number, data: GroupAssignmentRequest): Promise<GroupAssignment> {
    return this.patch<GroupAssignment>(BASE_ENDPOINT_V1, `/group-assignments/${assignmentId}`, data);
  }

  /**
   * Delete a group assignment (soft delete, cascades to grades and documents).
   * DELETE /group-assignments/:assignmentId
   * @param assignmentId - Assignment ID
   */
  static async deleteAssignment(assignmentId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/group-assignments/${assignmentId}`);
  }

  // ---------- Grades ----------

  /**
   * Get all grades for a group assignment.
   * GET /group-assignments/:assignmentId/grades
   * @param assignmentId - Assignment ID
   * @returns Array of GroupAssignmentGrade
   */
  static async getGrades(assignmentId: number): Promise<GroupAssignmentGrade[]> {
    return this.get<GroupAssignmentGrade[]>(BASE_ENDPOINT_V1, `/group-assignments/${assignmentId}/grades`);
  }

  /**
   * Create or update a grade for a group in an assignment.
   * PUT /group-assignments/:assignmentId/groups/:groupId/grade
   * @param assignmentId - Assignment ID
   * @param groupId - Saved group ID
   * @param grade - Numeric grade (0–10)
   */
  static async upsertGrade(assignmentId: number, groupId: number, grade: number): Promise<void> {
    return this.put<void>(
      BASE_ENDPOINT_V1,
      `/group-assignments/${assignmentId}/groups/${groupId}/grade`,
      { grade },
    );
  }

  /**
   * Delete a grade for a group in an assignment.
   * DELETE /group-assignments/:assignmentId/groups/:groupId/grade
   * @param assignmentId - Assignment ID
   * @param groupId - Saved group ID
   */
  static async deleteGrade(assignmentId: number, groupId: number): Promise<void> {
    return this.delete<void>(
      BASE_ENDPOINT_V1,
      `/group-assignments/${assignmentId}/groups/${groupId}/grade`,
    );
  }

  // ---------- Documents ----------

  /**
   * Upload a document at assignment level.
   * POST /group-assignments/:assignmentId/documents
   * @param assignmentId - Assignment ID
   * @param file - File to upload
   * @param description - Document description
   */
  static async uploadAssignmentDoc(assignmentId: number, file: File, description: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return this.postFormData<void>(BASE_ENDPOINT_V1, `/group-assignments/${assignmentId}/documents`, formData);
  }

  /**
   * Upload a document at group level for a specific assignment.
   * POST /group-assignments/:assignmentId/groups/:groupId/documents
   * @param assignmentId - Assignment ID
   * @param groupId - Saved group ID
   * @param file - File to upload
   * @param description - Document description
   */
  static async uploadGroupDoc(
    assignmentId: number,
    groupId: number,
    file: File,
    description: string,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return this.postFormData<void>(
      BASE_ENDPOINT_V1,
      `/group-assignments/${assignmentId}/groups/${groupId}/documents`,
      formData,
    );
  }

  /**
   * Download a document from a group assignment.
   * GET /group-assignments/:assignmentId/documents/:documentId/download
   * @param assignmentId - Assignment ID
   * @param documentId - Document ID
   * @returns Blob with file data
   */
  static async downloadDoc(assignmentId: number, documentId: number): Promise<Blob> {
    return this.getBlob(
      BASE_ENDPOINT_V1,
      `/group-assignments/${assignmentId}/documents/${documentId}/download`,
    );
  }

  /**
   * Delete a document from a group assignment (hard delete).
   * DELETE /group-assignments/:assignmentId/documents/:documentId
   * @param assignmentId - Assignment ID
   * @param documentId - Document ID
   */
  static async deleteDoc(assignmentId: number, documentId: number): Promise<void> {
    return this.delete<void>(
      BASE_ENDPOINT_V1,
      `/group-assignments/${assignmentId}/documents/${documentId}`,
    );
  }
}

