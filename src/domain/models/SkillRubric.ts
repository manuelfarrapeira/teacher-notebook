/**
 * Evaluation criterion within a rubric
 */
export interface SkillCriterion {
  id: number;
  description: string;
  gradeStart: number;
  gradeEnd: number;
}

/**
 * Domain entity representing a rubric with its criteria
 */
export interface SkillRubric {
  id: number;
  title: string;
  criteria: SkillCriterion[];
}

/**
 * DTO for creating or updating a criterion
 */
export interface CriterionRequest {
  description: string;
  gradeStart: number;
  gradeEnd: number;
}
