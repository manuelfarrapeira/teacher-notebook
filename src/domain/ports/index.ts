/**
 * Barrel export for domain ports.
 * All port interfaces are re-exported from here.
 *
 * Usage:
 *   import type { StudentPort, SchoolPort } from '../domain/ports';
 */

export type { StudentPort } from './StudentPort';
export type { SchoolPort } from './SchoolPort';
export type { ClassPort } from './ClassPort';
export type { ExercisePort } from './ExercisePort';
export type { SubjectPort } from './SubjectPort';
export type { AbsencePort } from './AbsencePort';
export type { CalendarAlertPort } from './CalendarAlertPort';
export type { ClassRubricPort } from './ClassRubricPort';
export type { SchedulePort } from './SchedulePort';
export type { SkillPort } from './SkillPort';
export type { SkillRubricPort } from './SkillRubricPort';
export type { StudentGroupPort } from './StudentGroupPort';
export type { AuthPort } from './AuthPort';
