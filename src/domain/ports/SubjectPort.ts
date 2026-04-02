import type { Subject, ClassSubject, SubjectRequestDTO } from '../models';

/**
 * Driven port for subject operations.
 */
export interface SubjectPort {
  getSubjects(): Promise<Subject[]>;
  createSubject(name: string): Promise<Subject>;
  updateSubject(subjectId: number, name: string): Promise<Subject>;
  deleteSubject(subjectId: number): Promise<void>;
  getClassSubjects(classId: number): Promise<ClassSubject[]>;
  getSubjectsByClass(classId: number): Promise<Subject[]>;
  assignSubjectsToClass(classId: number, subjectIds: number[]): Promise<void>;
  removeSubjectsFromClass(classId: number, subjectIds: number[]): Promise<void>;
}
