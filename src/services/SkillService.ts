import { BaseService } from './BaseService';

/**
 * Interface representing a Skill (competencia) entity
 */
export interface Skill {
  id: number;
  title: string;
  description: string;
}

/**
 * Interface for skill creation/update request
 */
export interface SkillRequestDTO {
  title: string;
  description: string;
}

/**
 * Service for managing skills (competencias)
 * Provides CRUD operations for skills
 */
export class SkillService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  /**
   * Get all skills for the authenticated teacher
   * GET /teacher-notebook/v1/skills
   * @returns Array of skills
   */
  static async getSkills(): Promise<Skill[]> {
    return this.get<Skill[]>(this.BASE_ENDPOINT, '/skills');
  }

  /**
   * Create a new skill
   * PUT /teacher-notebook/v1/skills
   * @param title - Title of the skill
   * @param description - Description of the skill
   * @returns Created skill
   */
  static async createSkill(title: string, description: string): Promise<Skill> {
    const requestBody: SkillRequestDTO = { title, description };
    return this.put<Skill>(this.BASE_ENDPOINT, '/skills', requestBody);
  }

  /**
   * Update an existing skill
   * PATCH /teacher-notebook/v1/skills/:id
   * @param id - ID of the skill to update
   * @param title - New title for the skill
   * @param description - New description for the skill
   * @returns Updated skill
   */
  static async updateSkill(id: number, title: string, description: string): Promise<Skill> {
    const requestBody: SkillRequestDTO = { title, description };
    return this.patch<Skill>(this.BASE_ENDPOINT, `/skills/${id}`, requestBody);
  }

  /**
   * Delete (soft delete) a skill
   * DELETE /teacher-notebook/v1/skills/:id
   * @param id - ID of the skill to delete
   */
  static async deleteSkill(id: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/skills/${id}`);
  }
}

