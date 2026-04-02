/**
 * Domain entity representing a skill
 */
export interface Skill {
  id: number;
  title: string;
  description: string;
}

/**
 * DTO for creating or updating a skill
 */
export interface SkillRequestDTO {
  title: string;
  description: string;
}
