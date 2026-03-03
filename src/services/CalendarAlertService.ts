import { BaseService } from './BaseService';

export interface CalendarAlert {
  id: number;
  date: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface CalendarAlertRequestDTO {
  date: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export class CalendarAlertService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';
  private static readonly RESOURCE = '/calendar-alerts';

  static async getByMonthYear(year: number, month: number): Promise<CalendarAlert[]> {
    return this.get<CalendarAlert[]>(this.BASE_ENDPOINT, `${this.RESOURCE}/${year}/${month}`);
  }

  static async create(data: CalendarAlertRequestDTO): Promise<CalendarAlert> {
    return this.put<CalendarAlert>(this.BASE_ENDPOINT, this.RESOURCE, data);
  }

  static async update(id: number, data: CalendarAlertRequestDTO): Promise<CalendarAlert> {
    return this.patch<CalendarAlert>(this.BASE_ENDPOINT, `${this.RESOURCE}/${id}`, data);
  }

  static async deleteAlert(id: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `${this.RESOURCE}/${id}`);
  }
}

