import { BaseService } from './BaseService';
export interface SchoolClass {
  id: number;
  schoolId: number;
  name: string;
  schoolYear: string;
}
export interface School {
  id: number;
  name: string;
  town: string;
  tlf: number;
  classes: SchoolClass[];
}
export class SchoolService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  static async getSchools(): Promise<School[]> {
    return this.get<School[]>(this.BASE_ENDPOINT, '/schools');
  }
}
