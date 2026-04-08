import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { CalendarAlert, CalendarAlertRequestDTO } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { CalendarAlert, CalendarAlertRequestDTO } from '../../domain/models';

export class CalendarAlertService extends BaseService {
  private static readonly RESOURCE = '/calendar-alerts';

  static async getByMonthYear(year: number, month: number): Promise<CalendarAlert[]> {
    return this.get<CalendarAlert[]>(BASE_ENDPOINT_V1, `${this.RESOURCE}/${year}/${month}`);
  }

  /**
   * Fetches alerts for a range of months in a single request
   */
  static async getByMonthRange(year: number, startMonth: number, endMonth: number): Promise<CalendarAlert[]> {
    return this.get<CalendarAlert[]>(BASE_ENDPOINT_V1, `${this.RESOURCE}/${year}/${startMonth}/${endMonth}`);
  }

  static async create(data: CalendarAlertRequestDTO): Promise<CalendarAlert> {
    return this.put<CalendarAlert>(BASE_ENDPOINT_V1, this.RESOURCE, data);
  }

  static async update(id: number, data: CalendarAlertRequestDTO): Promise<CalendarAlert> {
    return this.patch<CalendarAlert>(BASE_ENDPOINT_V1, `${this.RESOURCE}/${id}`, data);
  }

  static async deleteAlert(id: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `${this.RESOURCE}/${id}`);
  }
}
