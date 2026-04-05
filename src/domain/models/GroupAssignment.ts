/**
 * Document attached to a group assignment or a group's grade
 */
export interface GroupAssignmentDocument {
  /** Document ID */
  id: number;
  /** Filename on disk */
  document: string;
  /** User-facing description */
  description: string;
  /** Whether this document belongs to a specific group (true) or to the assignment itself (false) */
  groupDocument: boolean;
}

/**
 * Grade for a single group within a group assignment
 */
export interface GroupAssignmentGrade {
  /** Grade record ID */
  id: number;
  /** Parent assignment ID */
  groupAssignmentId: number;
  /** Saved group ID */
  groupId: number;
  /** Numeric grade (0–10) */
  grade: number;
  /** Group name (may be null if the group was deleted) */
  groupName: string | null;
  /** Documents uploaded specifically by/for this group */
  documents: GroupAssignmentDocument[];
}

/**
 * A cooperative group assignment (work/project) for a class
 */
export interface GroupAssignment {
  /** Assignment ID */
  id: number;
  /** Class this assignment belongs to */
  classId: number;
  /** Title of the assignment */
  title: string;
  /** Optional description */
  description: string;
  /** Academic quarter (1–3) */
  quarter: number;
  /** Documents attached at assignment level */
  documents: GroupAssignmentDocument[];
}

/**
 * DTO for creating or updating a group assignment
 */
export interface GroupAssignmentRequest {
  /** Title (required) */
  title: string;
  /** Optional description */
  description?: string;
  /** Quarter 1–3 (required) */
  quarter: number;
}

