import { BaseService } from './BaseService';
import { getApiUrl } from '../config/environment';
import type { ScheduleItem, ScheduleItemRequest, ScheduleCreateRequest, ScheduleDeleteRequest, ScheduleUpdateRequest } from '../../domain/models';
import { BASE_ENDPOINT_V1 } from './endpoints';

// Re-export domain types for backward compatibility
export type { ScheduleItem, ScheduleItemRequest, ScheduleCreateRequest, ScheduleDeleteRequest, ScheduleUpdateRequest } from '../../domain/models';

/**
 * Service for class schedule management.
 */
export class ScheduleService extends BaseService {

  /**
   * Get all schedule entries for a class.
   * GET /teacher-notebook/v1/classes/:class_id/schedules
   * @param classId - Class ID
   * @returns Array of schedule entries
   */
  static async getSchedules(classId: number): Promise<ScheduleItem[]> {
    return this.get<ScheduleItem[]>(BASE_ENDPOINT_V1, `/classes/${classId}/schedules`);
  }

  /**
   * Create a new schedule entry for a class.
   * PUT /teacher-notebook/v1/classes/:class_id/schedules
   * @param classId - Class ID
   * @param day - Day of the week (1-5)
   * @param items - Array of schedule items to create
   * @returns Created schedule items
   */
  static async createSchedule(classId: number, day: number, items: ScheduleItemRequest[]): Promise<ScheduleItem[]> {
    const requestBody: ScheduleCreateRequest = { day, items };
    return this.put<ScheduleItem[]>(BASE_ENDPOINT_V1, `/classes/${classId}/schedules`, requestBody);
  }

  /**
   * Update an existing schedule entry.
   * PATCH /teacher-notebook/v1/schedules/:schedule_id
   * @param scheduleId - Schedule entry ID
   * @param data - Updated schedule data
   * @returns Updated schedule entry
   */
  static async updateSchedule(scheduleId: number, data: ScheduleUpdateRequest): Promise<ScheduleItem> {
    return this.patch<ScheduleItem>(BASE_ENDPOINT_V1, `/schedules/${scheduleId}`, data);
  }

  /**
   * Delete schedule entries.
   * DELETE /teacher-notebook/v1/schedules
   * @param ids - Array of entry IDs to delete
   */
  static async deleteSchedules(ids: number[]): Promise<void> {
    const requestBody: ScheduleDeleteRequest = { ids };
    const apiUrl = getApiUrl();
    const url = `${apiUrl}${BASE_ENDPOINT_V1}/schedules`;

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
