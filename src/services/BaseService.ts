import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';
import { getCurrentLocale } from '../lib/i18n';

/**
 * Interfaz que representa el formato de error estándar del servidor
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
 * Clase base abstracta para servicios que requieren autenticación.
 * Centraliza la lógica común de HTTP: validación de token, headers,
 * métodos CRUD genéricos y manejo de errores del servidor.
 */
export abstract class BaseService {

  /**
   * Construye los headers comunes para las peticiones HTTP autenticadas
   * @param additionalHeaders - Headers adicionales opcionales
   * @returns Headers combinados con Authorization, Accept-Language y Content-Type
   */
  protected static buildHeaders(additionalHeaders?: HeadersInit): Headers {
    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept-Language': locale,
    });

    // Merge de headers adicionales si se proporcionan
    if (additionalHeaders) {
      const additionalHeadersObj = new Headers(additionalHeaders);
      additionalHeadersObj.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  /**
   * Valida la existencia del token de acceso antes de realizar una petición
   * @throws Error si no hay token válido y ejecuta logout
   */
  protected static validateToken(): void {
    const token = AuthService.getAccessToken();

    if (!token) {
      AuthService.forceLogout();
      throw new Error('No hay sesión activa. Por favor, inicia sesión.');
    }
  }

  /**
   * Maneja los errores de las respuestas HTTP de forma centralizada
   * @param response - Respuesta HTTP del servidor
   * @throws Error con mensaje apropiado según el tipo de error
   */
  protected static async handleErrorResponse(response: Response): Promise<never> {
    // Manejo de errores de autenticación
    if (response.status === 401 || response.status === 403) {
      AuthService.forceLogout();
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }

    // Intentar parsear el error del servidor
    try {
      const errorData: ApiError = await response.json();

      // Si hay detalles de validación, concatenarlos
      if (errorData.details && errorData.details.length > 0) {
        const detailsMessage = errorData.details
          .map(detail => `${detail.field}: ${detail.reason}`)
          .join('\n');
        throw new Error(detailsMessage);
      }

      // Si hay descripción, usarla
      if (errorData.description) {
        throw new Error(errorData.description);
      }

      // Si hay detail, usarlo
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }

      // Fallback al código de error
      throw new Error(`Error del servidor: ${errorData.code}`);

    } catch (parseError) {
      // Si no se puede parsear como JSON o no tiene el formato esperado
      // usar mensajes genéricos basados en el status code
      if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
        throw parseError;
      }

      switch (response.status) {
        case 400:
          throw new Error('Solicitud incorrecta. Por favor, verifica los datos enviados.');
        case 404:
          throw new Error('Recurso no encontrado.');
        case 500:
          throw new Error('Error interno del servidor. Por favor, intenta más tarde.');
        case 503:
          throw new Error('Servicio no disponible. Por favor, intenta más tarde.');
        default:
          throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
      }
    }
  }

  /**
   * Realiza una petición GET
   * @param baseEndpoint - Endpoint base del servicio (ej: '/teacher-notebook/v1')
   * @param endpoint - Endpoint relativo (será concatenado con baseEndpoint)
   * @param additionalHeaders - Headers adicionales opcionales
   * @returns Promesa con los datos tipados
   */
  protected static async get<T>(
    baseEndpoint: string,
    endpoint: string,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(additionalHeaders),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al realizar la petición GET.');
    }
  }

  /**
   * Realiza una petición POST
   * @param endpoint - Endpoint relativo (será concatenado con baseEndpoint)
   * @param body - Cuerpo de la petición
   * @param additionalHeaders - Headers adicionales opcionales
   * @returns Promesa con los datos tipados
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
      throw new Error('Error desconocido al realizar la petición POST.');
    }
  }

  /**
   * Realiza una petición PUT
   * @param endpoint - Endpoint relativo (será concatenado con baseEndpoint)
   * @param body - Cuerpo de la petición
   * @param additionalHeaders - Headers adicionales opcionales
   * @returns Promesa con los datos tipados
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
      throw new Error('Error desconocido al realizar la petición PUT.');
    }
  }

  /**
   * Realiza una petición DELETE
   * @param baseEndpoint - Endpoint base del servicio (ej: '/teacher-notebook/v1')
   * @param endpoint - Endpoint relativo (será concatenado con baseEndpoint)
   * @param additionalHeaders - Headers adicionales opcionales
   * @returns Promesa con los datos tipados
   */
  protected static async delete<T>(
    baseEndpoint: string,
    endpoint: string,
    additionalHeaders?: HeadersInit
  ): Promise<T> {
    this.validateToken();

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${baseEndpoint}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.buildHeaders(additionalHeaders),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Algunos DELETE no devuelven contenido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al realizar la petición DELETE.');
    }
  }

  /**
   * Realiza una petición PATCH
   * @param baseEndpoint - Endpoint base del servicio (ej: '/teacher-notebook/v1')
   * @param endpoint - Endpoint relativo (será concatenado con baseEndpoint)
   * @param body - Cuerpo de la petición
   * @param additionalHeaders - Headers adicionales opcionales
   * @returns Promesa con los datos tipados
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

    try {
      const response = await fetch(url, {
        method: 'PATCH',
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
      throw new Error('Error desconocido al realizar la petición PATCH.');
    }
  }
}

