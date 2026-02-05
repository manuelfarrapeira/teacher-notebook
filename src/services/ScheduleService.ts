import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';

/**
 * Interface representing a schedule entry
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
 * Interface for schedule item request (create)
 */
export interface ScheduleItemRequest {
  subjectId: number;
  start: string;
  end: string;
}

/**
 * Interface for schedule creation request
 */
export interface ScheduleCreateRequest {
  day: number;
  items: ScheduleItemRequest[];
}

/**
 * Interface for schedule update request
 */
export interface ScheduleUpdateRequest {
  day?: number;
  start?: string;
  end?: string;
}

/**
 * Interface for schedule delete request
 */
export interface ScheduleDeleteRequest {
  ids: number[];
}

/**
 * Service for managing class schedules
 * Provides CRUD operations for schedule entries
 */
export class ScheduleService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Get all schedule entries for a class
   * GET /teacher-notebook/v1/classes/:class_id/schedules
   * @param classId - ID of the class
   * @returns Array of schedule items
   */
  static async getSchedules(classId: number): Promise<ScheduleItem[]> {
    return this.get<ScheduleItem[]>(this.BASE_ENDPOINT, `/classes/${classId}/schedules`);
  }

  /**
   * Create a new schedule entry for a class
   * PUT /teacher-notebook/v1/classes/:class_id/schedules
   * @param classId - ID of the class
   * @param day - Day of the week (1-5)
   * @param items - Array of schedule items to create
   * @returns Created schedule items
   */
  static async createSchedule(
    classId: number,
    day: number,
    items: ScheduleItemRequest[]
  ): Promise<ScheduleItem[]> {
    const requestBody: ScheduleCreateRequest = { day, items };
    return this.put<ScheduleItem[]>(this.BASE_ENDPOINT, `/classes/${classId}/schedules`, requestBody);
  }

  /**
   * Update an existing schedule entry
   * PATCH /teacher-notebook/v1/schedules/:schedule_id
   * @param scheduleId - ID of the schedule entry to update
   * @param data - Updated schedule data
   * @returns Updated schedule item
   */
  static async updateSchedule(
    scheduleId: number,
    data: ScheduleUpdateRequest
  ): Promise<ScheduleItem> {
    return this.patch<ScheduleItem>(this.BASE_ENDPOINT, `/schedules/${scheduleId}`, data);
  }

  /**
   * Delete schedule entries
   * DELETE /teacher-notebook/v1/schedules
   * @param ids - Array of schedule entry IDs to delete
   */
  static async deleteSchedules(ids: number[]): Promise<void> {
    const requestBody: ScheduleDeleteRequest = { ids };
    const apiUrl = getApiUrl();
    const url = `${apiUrl}${this.BASE_ENDPOINT}/schedules`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: BaseService.buildHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Error deleting schedules');
    }
  }
}

