/**
 * Member information within a saved group (returned by the API)
 */
export interface GroupMember {
  /** Membership row ID */
  id: number;
  /** Student ID */
  studentId: number;
  /** Student first name */
  studentName: string;
  /** Student last name */
  studentSurnames: string;
}

/**
 * Persisted student group
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
