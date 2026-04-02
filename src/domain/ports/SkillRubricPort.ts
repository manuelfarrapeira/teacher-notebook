import type { SkillRubric, SkillCriterion, CriterionRequest } from '../models';

/**
 * Driven port for skill rubric and criterion operations.
 */
export interface SkillRubricPort {
  getRubrics(skillId: number): Promise<SkillRubric[]>;
  createRubric(skillId: number, title: string): Promise<SkillRubric>;
  updateRubric(rubricId: number, title: string): Promise<SkillRubric>;
  deleteRubric(rubricId: number): Promise<void>;
  getCriteria(rubricId: number): Promise<SkillCriterion[]>;
  createCriterion(rubricId: number, data: CriterionRequest): Promise<SkillCriterion>;
  updateCriterion(rubricId: number, criterionId: number, data: CriterionRequest): Promise<SkillCriterion>;
  deleteCriterion(rubricId: number, criterionId: number): Promise<void>;
}

