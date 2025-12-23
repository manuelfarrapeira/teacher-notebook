import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';
import { getCurrentLocale } from '../lib/i18n';

/**
 * Interface representing the standard error format from the backend
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

/**
 * Custom error class for API errors
 */
export class ApiErrorException extends Error {
  public apiError: ApiError;
  constructor(apiError: ApiError) {
    super(apiError.detail || apiError.description || apiError.code);
    this.name = 'ApiErrorException';
    this.apiError = apiError;
  }
}

/**
 * Abstract base class for services requiring authentication.
 * Centralizes common HTTP logic: token validation, headers,
 * generic CRUD methods, and centralized backend error handling.
 */
export abstract class BaseService {

  /**
   * Builds common headers for authenticated HTTP requests
   * @param additionalHeaders - Optional additional headers
   * @returns Headers combined with Authorization, Accept-Language, and Content-Type
   */
  protected static buildHeaders(additionalHeaders?: HeadersInit): Headers {
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
   * @throws Error if no valid token and triggers logout
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
        details: null
      });
    }
    try {
      const errorData: ApiError = await response.json();
      // Throw the backend error as is
      throw new ApiErrorException(errorData);
    } catch (parseError) {
      // If the error is already ApiErrorException, propagate it
      if (parseError instanceof ApiErrorException) {
        throw parseError;
      }
      // If JSON parsing fails, throw a generic ApiErrorException
      throw new ApiErrorException({
        code: String(response.status),
        description: response.statusText || 'ERROR',
        detail: 'Unknown error in the request.',
        details: null
      });
    }
  }

  /**
   * Performs a GET request
   * @param baseEndpoint - Service base endpoint (e.g. '/teacher-notebook/v1')
   * @param endpoint - Relative endpoint (will be concatenated with baseEndpoint)
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
   * Performs a POST request
   * @param baseEndpoint - Service base endpoint (e.g. '/teacher-notebook/v1')
   * @param endpoint - Relative endpoint (will be concatenated with baseEndpoint)
   * @param body - Request body
   * @param additionalHeaders - Optional additional headers
   * @returns Promise with typed data
   */
  protected static async post<T>(
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
        method: 'POST',
        headers: this.buildHeaders(additionalHeaders),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error performing POST request.');
    }
  }

  /**
   * Performs a PUT request
   * @param baseEndpoint - Service base endpoint (e.g. '/teacher-notebook/v1')
   * @param endpoint - Relative endpoint (will be concatenated with baseEndpoint)
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

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error performing PUT request.');
    }
  }

  /**
   * Performs a DELETE request
   * @param baseEndpoint - Service base endpoint (e.g. '/teacher-notebook/v1')
   * @param endpoint - Relative endpoint (will be concatenated with baseEndpoint)
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

    // Some DELETE requests do not return content
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }

  /**
   * Performs a PATCH request
   * @param baseEndpoint - Service base endpoint (e.g. '/teacher-notebook/v1')
   * @param endpoint - Relative endpoint (will be concatenated with baseEndpoint)
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

    return await response.json();
  }
}
