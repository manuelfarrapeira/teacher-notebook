import type { Student, StudentRequestDTO } from '../models';

/**
 * Driven port for student operations.
 * Infrastructure adapters must implement this contract.
 */
export interface StudentPort {
  getStudents(): Promise<Student[]>;
  createStudent(data: StudentRequestDTO): Promise<Student>;
  updateStudent(id: number, data: StudentRequestDTO): Promise<Student>;
  getPhotoUrl(studentId: number): string;
  uploadPhoto(studentId: number, file: File): Promise<void>;
  deletePhoto(studentId: number): Promise<void>;
  deleteStudent(studentId: number): Promise<void>;
  assignToClass(classId: number, studentId: number): Promise<void>;
  removeFromClass(classId: number, studentId: number): Promise<void>;
}

