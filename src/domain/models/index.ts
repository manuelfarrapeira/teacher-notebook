/**
 * Barrel export for domain models.
 * All entities and DTOs are re-exported from here for clean imports.
 *
 * Usage:
 *   import type { Student, Gender, Shape } from '../domain/models';
 */

// Student
export type { Gender, Shape, Student, StudentRequestDTO } from './Student';

// School & Class
export type { SchoolClass, School, SchoolRequestDTO } from './School';
export type { ClassRequestDTO } from './Class';

// Exercise
export type { ExerciseDocument, Exercise, ExerciseSubject, QuarterExercises, ExerciseRequest } from './Exercise';

// Grade
export type {
  GradeDocument, GradeExercise, GradeSubject,
  StudentQuarter, StudentGrades,
  GradeCreateRequest, GradeUpdateRequest
} from './Grade';

// Subject
export type { Subject, ClassSubject, SubjectRequestDTO } from './Subject';

// Absence
export type { Absence, AbsenceCreateRequest } from './Absence';

// Calendar Alert
export type { CalendarAlert, CalendarAlertRequestDTO } from './CalendarAlert';

// Class Rubric
export type {
  ClassRubricCriterion, ClassRubric,
  StudentCriterionAssignment, StudentCriteriaGroup
} from './ClassRubric';

// Schedule
export type {
  ScheduleItem, ScheduleItemRequest,
  ScheduleCreateRequest, ScheduleUpdateRequest, ScheduleDeleteRequest
} from './Schedule';

// Skill
export type { Skill, SkillRequestDTO } from './Skill';

// Skill Rubric
export type { SkillCriterion, SkillRubric, CriterionRequest } from './SkillRubric';

// Student Group
export type { GroupMember, SavedGroup, SavedGroupRequest } from './StudentGroup';

// Group Assignment
export type {
  GroupAssignmentDocument, GroupAssignmentGrade,
  GroupAssignment, GroupAssignmentRequest
} from './GroupAssignment';

// API
export type { ApiError } from './Api';
