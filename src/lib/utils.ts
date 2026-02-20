import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"
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

/**
 * Hook que detecta si la pantalla es móvil (≤768px).
 * Se actualiza automáticamente al redimensionar la ventana.
 * @returns true si el ancho de la ventana es ≤ 768px
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handler);
    setIsMobile(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Comprueba si hoy es el cumpleaños de un alumno comparando día y mes.
 * @param dateOfBirth - Fecha de nacimiento en formato DD/MM/YYYY
 * @returns true si hoy es el cumpleaños del alumno
 */
export function isBirthday(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const parts = dateOfBirth.split('/');
  if (parts.length !== 3) return false;

  const day = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const today = new Date();

  return today.getDate() === day && today.getMonth() + 1 === month;
}

