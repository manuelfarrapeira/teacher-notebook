import type { ClassRubric, StudentCriteriaGroup } from '../models';

/**
 * Driven port for class rubric and student criteria operations.
 */
export interface ClassRubricPort {
  // Class rubrics
  getClassRubrics(classId: number): Promise<ClassRubric[]>;
  assignRubricToClass(classId: number, rubricId: number): Promise<void>;
  removeRubricFromClass(classRubricId: number): Promise<void>;

  // Student criteria
  getAllStudentCriteria(classId: number): Promise<StudentCriteriaGroup[]>;
  getStudentCriteria(classId: number, studentId: number): Promise<StudentCriteriaGroup[]>;
  assignCriterionToStudent(classRubricId: number, studentId: number, criterionId: number): Promise<void>;
  updateStudentCriterion(studentCriterionId: number, criterionId: number): Promise<void>;
  removeStudentCriterion(studentCriterionId: number): Promise<void>;
}

