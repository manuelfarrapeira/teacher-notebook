/**
 * Domain entity representing a calendar alert
 */
export interface CalendarAlert {
  id: number;
  date: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * DTO for creating or updating a calendar alert
 */
export interface CalendarAlertRequestDTO {
  date: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}
