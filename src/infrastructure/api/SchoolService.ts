import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { School, SchoolClass, SchoolRequestDTO } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { SchoolClass, School, SchoolRequestDTO } from '../../domain/models';

export class SchoolService extends BaseService {

  static async getSchools(): Promise<School[]> {
    return this.get<School[]>(BASE_ENDPOINT_V1, '/schools');
  }

  static async createSchool(schoolData: SchoolRequestDTO): Promise<School> {
    return this.put<School>(BASE_ENDPOINT_V1, '/schools', schoolData);
  }

  static async updateSchool(id: number, schoolData: SchoolRequestDTO): Promise<School> {
    return this.patch<School>(BASE_ENDPOINT_V1, `/schools/${id}`, schoolData);
  }

  static async deleteSchool(id: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/schools/${id}`);
  }
}
