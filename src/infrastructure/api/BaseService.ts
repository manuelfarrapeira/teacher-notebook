import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';
import { getCurrentLocale } from '../../lib/i18n';
import type { ApiError } from '../../domain/models';

/**
 * Re-export of ApiError domain type
 * @deprecated Import ApiError from '../../domain/models'
 */
export type { ApiError } from '../../domain/models';

/**
 * Custom error class for API errors
 */
export class ApiErrorException extends Error {
  public apiError: ApiError;
  constructor(apiError: ApiError) {
    const validationReasons = apiError.details?.map(d => d.reason).join('. ');
    super(apiError.detail || validationReasons || apiError.description || apiError.code);
    this.name = 'ApiErrorException';
    this.apiError = apiError;
  }
}

/**
 * Abstract base class for API adapters.
 * Centralizes common HTTP logic: token validation, headers,
 * generic CRUD methods, and centralized backend error handling.
 *
 * This is the infrastructure base — all driven adapters extend it.
 */
export abstract class BaseService {

  /**
   * Builds common headers for authenticated HTTP requests
   * @param additionalHeaders - Optional additional headers
   * @returns Combined headers with Authorization, Accept-Language, and Content-Type
   */
  public static buildHeaders(additionalHeaders?: HeadersInit): Headers {
    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    if (additionalHeaders) {
      const additionalHeadersObj = new Headers(additionalHeaders);
      additionalHeadersObj.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  /**
   * Validates the existence of an access token before making a request
   * @throws Error if no valid token exists and triggers logout
   */
  protected static validateToken(): void {
    const token = AuthService.getAccessToken();

    if (!token) {
      AuthService.forceLogout();
      throw new Error('No active session. Please log in.');
    }
  }

  /**
   * Centralized error handling for HTTP responses
   * @param response - HTTP response from the backend
   * @throws ApiErrorException for the frontend to handle as needed
   */
  protected static async handleErrorResponse(response: Response): Promise<never> {
    if (response.status === 401 || response.status === 403) {
      AuthService.forceLogout();
      throw new ApiErrorException({
        code: '401',
        description: 'UNAUTHORIZED',
        detail: 'Your session has expired. Please log in again.',
      });
    }

    let errorData: ApiError | null;
    try {
      errorData = await response.json() as ApiError;
    } catch {
      errorData = null;
    }

    if (errorData) {
      throw new ApiErrorException(errorData);
    }

    throw new ApiErrorException({
      code: String(response.status),
      description: response.statusText || 'ERROR',
      detail: 'Unknown error in the request.',
    });
  }

  /**
   * Performs a GET request
   * @param baseEndpoint - Service base endpoint (e.g. '/teacher-notebook/v1')
   * @param endpoint - Relative endpoint (concatenated with baseEndpoint)
   * @param additionalHeaders - Optional additional headers
   * @returns Promise with typed data
   */
  protected static async get<T>(
    baseEndpoint: string,
    endpoint: string,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(additionalHeaders),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return await response.json();
  }


  /**
   * Performs a PUT request
   * @param baseEndpoint - Service base endpoint
   * @param endpoint - Relative endpoint
   * @param body - Request body
   * @param additionalHeaders - Optional additional headers
   * @returns Promise with typed data
   */
  protected static async put<T>(
    baseEndpoint: string,
    endpoint: string,
    body?: unknown,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.buildHeaders(additionalHeaders),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error performing PUT request.');
    }
  }

  /**
   * Performs a DELETE request
   * @param baseEndpoint - Service base endpoint
   * @param endpoint - Relative endpoint
   * @param additionalHeaders - Optional additional headers
   * @returns Promise with typed data
   */
  protected static async delete<T>(
    baseEndpoint: string,
    endpoint: string,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(additionalHeaders),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }

  /**
   * Performs a DELETE request with body
   * @param baseEndpoint - Service base endpoint
   * @param endpoint - Relative endpoint
   * @param body - Request body
   * @param additionalHeaders - Optional additional headers
   * @returns Promise with typed data
   */
  protected static async deleteWithBody<T>(
    baseEndpoint: string,
    endpoint: string,
    body?: unknown,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(additionalHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }

  /**
   * Performs a PATCH request
   * @param baseEndpoint - Service base endpoint
   * @param endpoint - Relative endpoint
   * @param body - Request body
   * @param additionalHeaders - Optional additional headers
   * @returns Promise with typed data
   */
  protected static async patch<T>(
    baseEndpoint: string,
    endpoint: string,
    body?: unknown,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(additionalHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }
}
