import type { CalendarAlert, CalendarAlertRequestDTO } from '../models';

/**
 * Driven port for calendar alert operations.
 */
export interface CalendarAlertPort {
  getByMonthYear(year: number, month: number): Promise<CalendarAlert[]>;
  create(data: CalendarAlertRequestDTO): Promise<CalendarAlert>;
  update(id: number, data: CalendarAlertRequestDTO): Promise<CalendarAlert>;
  deleteAlert(id: number): Promise<void>;
}
