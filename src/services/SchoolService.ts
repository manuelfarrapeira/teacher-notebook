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

export interface SchoolRequestDTO {
  name: string;
  town?: string;
  tlf?: number;
}

export class SchoolService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  static async getSchools(): Promise<School[]> {
    return this.get<School[]>(this.BASE_ENDPOINT, '/schools');
  }

  static async createSchool(schoolData: SchoolRequestDTO): Promise<School> {
    return this.put<School>(this.BASE_ENDPOINT, '/schools', schoolData);
  }

  static async updateSchool(id: number, schoolData: SchoolRequestDTO): Promise<School> {
    return this.patch<School>(this.BASE_ENDPOINT, `/schools/${id}`, schoolData);
  }

  static async deleteSchool(id: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/schools/${id}`);
  }
}
