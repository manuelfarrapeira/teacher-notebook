/**
 * Standard error format from the backend API
 */
export interface ApiError {
  code: string;
  description: string;
  detail: string | null;
  details?: Array<{
    field: string;
    reason: string;
  }>;
}
