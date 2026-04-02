import type { SavedGroup, SavedGroupRequest } from '../models';

/**
 * Driven port for cooperative student group operations.
 */
export interface StudentGroupPort {
  getSavedGroups(classId: number): Promise<SavedGroup[]>;
  createSavedGroups(classId: number, groups: SavedGroupRequest[]): Promise<void>;
  updateSavedGroups(classId: number, groups: SavedGroupRequest[]): Promise<void>;
  deleteSavedGroups(classId: number): Promise<void>;
  generateGroups(classId: number, prioritizeShapeDiversity: boolean): Promise<number[][]>;
}
