import React, { createContext, useContext, useState, useRef, ReactNode, useMemo, useCallback } from 'react';

/**
 * Interface for cached photo data
 */
interface PhotoCache {
  url: string;
  timestamp: number;
}

/**
 * Context type for student photo cache management
 */
interface StudentPhotoContextType {
  getCachedPhoto: (studentId: number) => string | null;
  setCachedPhoto: (studentId: number, url: string) => void;
  invalidatePhoto: (studentId: number) => void;
  getCacheVersion: (studentId: number) => number;
  clearCache: () => void;
}

const StudentPhotoContext = createContext<StudentPhotoContextType | undefined>(undefined);

/**
 * Provider component for student photo cache.
 * Manages a global cache of photo URLs to avoid redundant API calls.
 * Uses a ref for the cache Map (no re-renders on cache hits) and
 * a state-based version map for targeted invalidation signals.
 */
export function StudentPhotoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const cacheRef = useRef<Map<number, PhotoCache>>(new Map());
  const [versions, setVersions] = useState<Map<number, number>>(new Map());

  /**
   * Get cached photo URL for a student.
   * Reads from a ref so the function reference is stable.
   * @param studentId - Student ID
   * @returns Cached URL or null if not cached
   */
  const getCachedPhoto = useCallback((studentId: number): string | null => {
    const cached = cacheRef.current.get(studentId);
    return cached ? cached.url : null;
  }, []);

  /**
   * Store photo URL in cache.
   * Updates the ref without causing re-renders.
   * @param studentId - Student ID
   * @param url - Object URL from blob
   */
  const setCachedPhoto = useCallback((studentId: number, url: string) => {
    cacheRef.current.set(studentId, { url, timestamp: Date.now() });
  }, []);

  /**
   * Remove photo from cache and signal the specific StudentPhoto component to reload.
   * Revokes the old object URL and increments the version counter.
   * @param studentId - Student ID
   */
  const invalidatePhoto = useCallback((studentId: number) => {
    const cached = cacheRef.current.get(studentId);
    if (cached) {
      URL.revokeObjectURL(cached.url);
    }
    cacheRef.current.delete(studentId);
    setVersions(prev => {
      const next = new Map(prev);
      next.set(studentId, (prev.get(studentId) ?? 0) + 1);
      return next;
    });
  }, []);

  /**
   * Get the invalidation version for a specific student.
   * Used as an effect dependency in StudentPhoto to detect cache invalidation.
   * @param studentId - Student ID
   * @returns Current version number (0 if never invalidated)
   */
  const getCacheVersion = useCallback((studentId: number): number => {
    return versions.get(studentId) ?? 0;
  }, [versions]);

  /**
   * Clear all cached photos and revoke all object URLs (used on logout)
   */
  const clearCache = useCallback(() => {
    cacheRef.current.forEach(cached => {
      URL.revokeObjectURL(cached.url);
    });
    cacheRef.current.clear();
    setVersions(new Map());
  }, []);

  const contextValue = useMemo(() => ({
    getCachedPhoto,
    setCachedPhoto,
    invalidatePhoto,
    getCacheVersion,
    clearCache
  }), [getCachedPhoto, setCachedPhoto, invalidatePhoto, getCacheVersion, clearCache]);

  return (
    <StudentPhotoContext.Provider value={contextValue}>
      {children}
    </StudentPhotoContext.Provider>
  );
}

/**
 * Hook to access the student photo cache
 * @throws Error if used outside of StudentPhotoProvider
 */
export function useStudentPhotoCache() {
  const context = useContext(StudentPhotoContext);
  if (!context) {
    throw new Error('useStudentPhotoCache must be used within StudentPhotoProvider');
  }
  return context;
}
