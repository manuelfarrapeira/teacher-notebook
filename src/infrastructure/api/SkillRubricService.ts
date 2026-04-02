import { BaseService } from './BaseService';
import { BASE_ENDPOINT_V1 } from './endpoints';
import type { SkillRubric, SkillCriterion, CriterionRequest } from '../../domain/models';

// Re-export domain types for backward compatibility
export type { SkillCriterion, SkillRubric, CriterionRequest } from '../../domain/models';

/**
 * Service for skill rubric and criterion management.
 */
export class SkillRubricService extends BaseService {

  // ========================
  // Rubric endpoints
  // ========================

  /**
   * Get all rubrics for a skill (includes criteria).
   * GET /teacher-notebook/v1/skills/:skillId/rubrics
   * @param skillId - Skill ID
   * @returns Array of rubrics with criteria
   */
  static async getRubrics(skillId: number): Promise<SkillRubric[]> {
    return this.get<SkillRubric[]>(BASE_ENDPOINT_V1, `/skills/${skillId}/rubrics`);
  }

  /**
   * Create a new rubric for a skill.
   * PUT /teacher-notebook/v1/skills/:skillId/rubrics
   * @param skillId - Skill ID
   * @param title - Rubric title
   * @returns Created rubric
   */
  static async createRubric(skillId: number, title: string): Promise<SkillRubric> {
    return this.put<SkillRubric>(BASE_ENDPOINT_V1, `/skills/${skillId}/rubrics`, { title });
  }

  /**
   * Update a rubric title.
   * PATCH /teacher-notebook/v1/rubrics/:rubricId
   * @param rubricId - Rubric ID
   * @param title - New title
   * @returns Updated rubric
   */
  static async updateRubric(rubricId: number, title: string): Promise<SkillRubric> {
    return this.patch<SkillRubric>(BASE_ENDPOINT_V1, `/rubrics/${rubricId}`, { title });
  }

  /**
   * Delete a rubric (soft delete, also deletes its criteria).
   * DELETE /teacher-notebook/v1/rubrics/:rubricId
   * @param rubricId - Rubric ID
   */
  static async deleteRubric(rubricId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/rubrics/${rubricId}`);
  }

  // ========================
  // Criterion endpoints
  // ========================

  /**
   * Get all criteria for a rubric.
   * GET /teacher-notebook/v1/rubrics/:rubricId/criteria
   * @param rubricId - Rubric ID
   * @returns Array of criteria
   */
  static async getCriteria(rubricId: number): Promise<SkillCriterion[]> {
    return this.get<SkillCriterion[]>(BASE_ENDPOINT_V1, `/rubrics/${rubricId}/criteria`);
  }

  /**
   * Create a criterion for a rubric.
   * PUT /teacher-notebook/v1/rubrics/:rubricId/criteria
   * @param rubricId - Rubric ID
   * @param data - Criterion data
   * @returns Created criterion
   */
  static async createCriterion(rubricId: number, data: CriterionRequest): Promise<SkillCriterion> {
    return this.put<SkillCriterion>(BASE_ENDPOINT_V1, `/rubrics/${rubricId}/criteria`, data);
  }

  /**
   * Update a criterion.
   * PATCH /teacher-notebook/v1/rubrics/:rubricId/criteria/:criterionId
   * @param rubricId - Rubric ID
   * @param criterionId - Criterion ID
   * @param data - Updated criterion data
   * @returns Updated criterion
   */
  static async updateCriterion(
    rubricId: number,
    criterionId: number,
    data: CriterionRequest
  ): Promise<SkillCriterion> {
    return this.patch<SkillCriterion>(BASE_ENDPOINT_V1, `/rubrics/${rubricId}/criteria/${criterionId}`, data);
  }

  /**
   * Delete a criterion (soft delete).
   * DELETE /teacher-notebook/v1/rubrics/:rubricId/criteria/:criterionId
   * @param rubricId - Rubric ID
   * @param criterionId - Criterion ID
   */
  static async deleteCriterion(rubricId: number, criterionId: number): Promise<void> {
    return this.delete<void>(BASE_ENDPOINT_V1, `/rubrics/${rubricId}/criteria/${criterionId}`);
  }
}
