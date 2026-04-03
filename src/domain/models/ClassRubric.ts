/**
 * Criterion belonging to a class rubric
 */
export interface ClassRubricCriterion {
  id: number;
  description: string;
  gradeStart: number;
  gradeEnd: number;
  /** Optional textual qualification label (e.g. "Insuficiente", "Notable") */
  qualification?: string;
}

/**
 * Rubric assigned to a class
 */
export interface ClassRubric {
  /** classRubricId — used for assign/remove operations */
  id: number;
  classId: number;
  rubricId: number;
  rubricTitle: string;
  skillId: number;
  criteria: ClassRubricCriterion[];
}

/**
 * Assignment of a criterion to a student within a class rubric
 */
export interface StudentCriterionAssignment {
  /** studentCriterionId — used for update/delete */
  id: number;
  classRubricId: number;
  rubric: {
    id: number;
    title: string;
  };
  criterion: {
    id: number;
    description: string;
    gradeStart: number;
    gradeEnd: number;
    qualification?: string;
  };
}

/**
 * Student with their criterion assignments
 */
export interface StudentCriteriaGroup {
  student: {
    id: number;
    name: string;
    surnames: string;
  };
  rubricCriteria: StudentCriterionAssignment[];
}
