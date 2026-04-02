import type { Skill } from '../models';

/**
 * Driven port for skill operations.
 */
export interface SkillPort {
  getSkills(): Promise<Skill[]>;
  createSkill(title: string, description: string): Promise<Skill>;
  updateSkill(id: number, title: string, description: string): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
}
