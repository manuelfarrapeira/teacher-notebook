import type { ScheduleItem, ScheduleItemRequest, ScheduleUpdateRequest } from '../models';

/**
 * Driven port for schedule operations.
 */
export interface SchedulePort {
  getSchedules(classId: number): Promise<ScheduleItem[]>;
  createSchedule(classId: number, day: number, items: ScheduleItemRequest[]): Promise<ScheduleItem[]>;
  updateSchedule(scheduleId: number, data: ScheduleUpdateRequest): Promise<ScheduleItem>;
  deleteSchedules(ids: number[]): Promise<void>;
}
