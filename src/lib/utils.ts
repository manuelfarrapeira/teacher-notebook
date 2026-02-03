import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { School } from "../services/SchoolService"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte fecha de formato ISO (YYYY-MM-DD) a formato API (DD/MM/YYYY)
 * @param isoDate - Fecha en formato YYYY-MM-DD
 * @returns Fecha en formato DD/MM/YYYY
 */
export function formatDateForApi(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Convierte fecha de formato API (DD/MM/YYYY) a formato ISO (YYYY-MM-DD)
 * @param apiDate - Fecha en formato DD/MM/YYYY
 * @returns Fecha en formato YYYY-MM-DD
 */
export function formatDateForInput(apiDate: string): string {
  const [day, month, year] = apiDate.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene información de las clases a las que pertenece un alumno
 * @param classIds - Array de IDs de clases del alumno
 * @param schools - Array de colegios con sus clases
 * @returns Array de objetos con schoolName, className, classId, schoolYear
 */
export function getStudentClasses(classIds: number[], schools: School[]) {
  const classes: Array<{ schoolName: string; className: string; classId: number; schoolYear: string }> = [];

  for (const school of schools) {
    for (const cls of school.classes) {
      if (classIds.includes(cls.id)) {
        classes.push({
          schoolName: school.name,
          className: cls.name,
          classId: cls.id,
          schoolYear: cls.schoolYear
        });
      }
    }
  }

  return classes;
}

