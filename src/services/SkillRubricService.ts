import { BaseService } from './BaseService';

// ========================
// Skill Rubric interfaces
// ========================

/**
 * Criterion (criterio de evaluación) entity
 */
export interface SkillCriterion {
  id: number;
  description: string;
  gradeStart: number;
  gradeEnd: number;
}

/**
 * Rubric entity with its criteria
 */
export interface SkillRubric {
  id: number;
  title: string;
  criteria: SkillCriterion[];
}

/**
 * Request body to create/update a criterion
 */
export interface CriterionRequest {
  description: string;
  gradeStart: number;
  gradeEnd: number;
}

/**
 * Service for managing skill rubrics and criteria.
 * Inherits from BaseService for authenticated HTTP calls.
 */
export class SkillRubricService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  // ========================
  // Rubric endpoints
  // ========================

  /**
   * Get all rubrics for a skill (includes criteria)
   * GET /teacher-notebook/v1/skills/:skillId/rubrics
   * @param skillId - ID of the skill
   * @returns Array of rubrics with criteria
   */
  static async getRubrics(skillId: number): Promise<SkillRubric[]> {
    return this.get<SkillRubric[]>(this.BASE_ENDPOINT, `/skills/${skillId}/rubrics`);
  }

  /**
   * Create a new rubric for a skill
   * PUT /teacher-notebook/v1/skills/:skillId/rubrics
   * @param skillId - ID of the skill
   * @param title - Title of the rubric
   * @returns Created rubric
   */
  static async createRubric(skillId: number, title: string): Promise<SkillRubric> {
    return this.put<SkillRubric>(this.BASE_ENDPOINT, `/skills/${skillId}/rubrics`, { title });
  }

  /**
   * Update a rubric title
   * PATCH /teacher-notebook/v1/rubrics/:rubricId
   * @param rubricId - ID of the rubric
   * @param title - New title
   * @returns Updated rubric
   */
  static async updateRubric(rubricId: number, title: string): Promise<SkillRubric> {
    return this.patch<SkillRubric>(this.BASE_ENDPOINT, `/rubrics/${rubricId}`, { title });
  }

  /**
   * Delete a rubric (soft delete, also hard-deletes its criteria)
   * DELETE /teacher-notebook/v1/rubrics/:rubricId
   * @param rubricId - ID of the rubric
   */
  static async deleteRubric(rubricId: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/rubrics/${rubricId}`);
  }

  // ========================
  // Criterion endpoints
  // ========================

  /**
   * Get all criteria for a rubric
   * GET /teacher-notebook/v1/rubrics/:rubricId/criteria
   * @param rubricId - ID of the rubric
   * @returns Array of criteria
   */
  static async getCriteria(rubricId: number): Promise<SkillCriterion[]> {
    return this.get<SkillCriterion[]>(this.BASE_ENDPOINT, `/rubrics/${rubricId}/criteria`);
  }

  /**
   * Create a criterion for a rubric
   * PUT /teacher-notebook/v1/rubrics/:rubricId/criteria
   * @param rubricId - ID of the rubric
   * @param data - Criterion request data
   * @returns Created criterion
   */
  static async createCriterion(rubricId: number, data: CriterionRequest): Promise<SkillCriterion> {
    return this.put<SkillCriterion>(this.BASE_ENDPOINT, `/rubrics/${rubricId}/criteria`, data);
  }

  /**
   * Update a criterion
   * PATCH /teacher-notebook/v1/rubrics/:rubricId/criteria/:criterionId
   * @param rubricId - ID of the rubric
   * @param criterionId - ID of the criterion
   * @param data - Criterion request data
   * @returns Updated criterion
   */
  static async updateCriterion(
    rubricId: number,
    criterionId: number,
    data: CriterionRequest
  ): Promise<SkillCriterion> {
    return this.patch<SkillCriterion>(
      this.BASE_ENDPOINT,
      `/rubrics/${rubricId}/criteria/${criterionId}`,
      data
    );
  }

  /**
   * Delete a criterion (soft delete)
   * DELETE /teacher-notebook/v1/rubrics/:rubricId/criteria/:criterionId
   * @param rubricId - ID of the rubric
   * @param criterionId - ID of the criterion
   */
  static async deleteCriterion(rubricId: number, criterionId: number): Promise<void> {
    return this.delete<void>(
      this.BASE_ENDPOINT,
      `/rubrics/${rubricId}/criteria/${criterionId}`
    );
  }
}

