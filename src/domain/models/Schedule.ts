/**
 * Domain entity representing a schedule entry
 */
export interface ScheduleItem {
  id: number;
  classId: number;
  subjectId: number;
  day: number; // 1-5 (Monday-Friday)
  start: string; // Format: "HH:mm"
  end: string; // Format: "HH:mm"
}

/**
 * Item within a schedule creation request
 */
export interface ScheduleItemRequest {
  subjectId: number;
  start: string;
  end: string;
}

/**
 * Request for creating schedule entries for a day
 */
export interface ScheduleCreateRequest {
  day: number;
  items: ScheduleItemRequest[];
}

/**
 * Request for updating a schedule entry
 */
export interface ScheduleUpdateRequest {
  day?: number;
  start?: string;
  end?: string;
}

/**
 * Request for deleting schedule entries
 */
export interface ScheduleDeleteRequest {
  ids: number[];
}
