/**
 * Barrel export for infrastructure API adapters.
 * All adapter services and their re-exported domain types are available from here.
 *
 * Usage:
 *   import { StudentService } from '../infrastructure/api';
 *   import { AuthService } from '../infrastructure/api';
 */

export { BaseService, ApiErrorException } from './BaseService';
export type { ApiError } from './BaseService';
export { AuthService } from './AuthService';
export { StudentService } from './StudentService';
export { SchoolService } from './SchoolService';
export { ClassService } from './ClassService';
export { ExerciseService } from './ExerciseService';
export { SubjectService } from './SubjectService';
export { AbsenceService } from './AbsenceService';
export { CalendarAlertService } from './CalendarAlertService';
export { ClassRubricService } from './ClassRubricService';
export { ScheduleService } from './ScheduleService';
export { SkillService } from './SkillService';
export { SkillRubricService } from './SkillRubricService';
export { StudentGroupService } from './StudentGroupService';
export { GroupAssignmentService } from './GroupAssignmentService';
