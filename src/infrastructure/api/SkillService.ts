import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { Skill, SkillRequestDTO } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { Skill, SkillRequestDTO } from '../../domain/models';

/**
 * Service for skill management.
 * CRUD operations for skills.
 */
export class SkillService extends BaseService {

  /**
   * Get all skills for the authenticated teacher.
   * GET /teacher-notebook/v1/skills
   * @returns Array of skills
   */
  static async getSkills(): Promise<Skill[]> {
    return this.get<Skill[]>(BASE_ENDPOINT_V1, '/skills');
  }

  /**
   * Create a new skill.
   * PUT /teacher-notebook/v1/skills
   * @param title - Skill title
   * @param description - Skill description
   * @returns Created skill
   */
  static async createSkill(title: string, description: string): Promise<Skill> {
    const requestBody: SkillRequestDTO = { title, description };
    return this.put<Skill>(BASE_ENDPOINT_V1, '/skills', requestBody);
  }

  /**
   * Update an existing skill.
   * PATCH /teacher-notebook/v1/skills/:id
   * @param id - Skill ID
   * @param title - New title
   * @param description - New description
   * @returns Updated skill
   */
  static async updateSkill(id: number, title: string, description: string): Promise<Skill> {
    const requestBody: SkillRequestDTO = { title, description };
    return this.patch<Skill>(BASE_ENDPOINT_V1, `/skills/${id}`, requestBody);
  }

  /**
   * Delete a skill (soft delete).
   * DELETE /teacher-notebook/v1/skills/:id
   * @param id - Skill ID
   */
  static async deleteSkill(id: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/skills/${id}`);
  }
}
