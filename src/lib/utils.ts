import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"
import { School } from "../infrastructure/api/SchoolService"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a date from ISO format (YYYY-MM-DD) to API format (DD/MM/YYYY)
 * @param isoDate - Date in YYYY-MM-DD format
 * @returns Date in DD/MM/YYYY format
 */
export function formatDateForApi(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Converts a date from API format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 * @param apiDate - Date in DD/MM/YYYY format
 * @returns Date in YYYY-MM-DD format
 */
export function formatDateForInput(apiDate: string): string {
  const [day, month, year] = apiDate.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Gets information about the classes a student belongs to
 * @param classIds - Array of class IDs the student is assigned to
 * @param schools - Array of schools with their classes
 * @returns Array of objects with schoolName, className, classId, schoolYear
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
 * Hook that detects if the screen is mobile (≤768px).
 * Automatically updates on window resize.
 * @returns true if the window width is ≤ 768px
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
 * Checks if today is a student's birthday by comparing day and month.
 * @param dateOfBirth - Date of birth in DD/MM/YYYY format
 * @returns true if today is the student's birthday
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
