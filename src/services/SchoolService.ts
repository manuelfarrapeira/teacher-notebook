import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';
import { getCurrentLocale } from '../lib/i18n';

export interface SchoolClass {
  id: number;
  schoolId: number;
  name: string;
  schoolYear: string;
}

export interface School {
  id: number;
  name:string;
  town: string;
  tlf: number;
  classes: SchoolClass[];
}

export class SchoolService {
  static async getSchools(): Promise<School[]> {
    const apiUrl = await getApiUrl();
    const token = AuthService.getAccessToken();
    const locale = getCurrentLocale();

    if (!token) {
      AuthService.forceLogout();
      throw new Error('No hay sesión activa. Por favor, inicia sesión.');
    }

    try {
      const response = await fetch(`${apiUrl}/teacher-notebook/v1/schools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept-Language': locale
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        AuthService.forceLogout();
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error('No se pudieron obtener los datos de los colegios.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schools:', error);
      if (error instanceof Error && error.message.includes('sesión')) {
        throw error;
      }
      throw new Error('Se ha producido un error al obtener los datos de los colegios.');
    }
  }
}
