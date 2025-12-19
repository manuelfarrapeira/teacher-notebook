import { getApiUrl } from '../config/environment';
import { AuthService } from './AuthService';

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

    if (!token) {
      AuthService.forceLogout();
      return [];
    }

    try {
      const response = await fetch(`${apiUrl}/teacher-notebook/v1/schools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudieron obtener los datos de los colegios.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw new Error('Se ha producido un error al obtener los datos de los colegios.');
    }
  }
}
