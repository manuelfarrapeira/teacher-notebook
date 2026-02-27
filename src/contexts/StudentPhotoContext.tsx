import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

/**
 * Interface representing cached photo data
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
  clearCache: () => void;
}

const StudentPhotoContext = createContext<StudentPhotoContextType | undefined>(undefined);

/**
 * Provider component for student photo caching
 * Manages a global cache of student photo URLs to avoid redundant API calls
 */
export function StudentPhotoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [cache, setCache] = useState<Map<number, PhotoCache>>(new Map());

  /**
   * Get cached photo URL for a student
   * @param studentId - Student ID
   * @returns Cached URL or null if not in cache
   */
  const getCachedPhoto = useCallback((studentId: number): string | null => {
    const cached = cache.get(studentId);
    return cached ? cached.url : null;
  }, [cache]);

  /**
   * Store photo URL in cache
   * @param studentId - Student ID
   * @param url - Object URL from blob
   */
  const setCachedPhoto = useCallback((studentId: number, url: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(studentId, {
        url,
        timestamp: Date.now()
      });
      return newCache;
    });
  }, []);

  /**
   * Remove photo from cache (used when photo is uploaded/deleted)
   * @param studentId - Student ID
   */
  const invalidatePhoto = useCallback((studentId: number) => {
    setCache(prev => {
      const newCache = new Map(prev);
      const cached = newCache.get(studentId);
      if (cached) {
        URL.revokeObjectURL(cached.url);
      }
      newCache.delete(studentId);
      return newCache;
    });
  }, []);

  /**
   * Clear all cached photos (used on logout)
   */
  const clearCache = useCallback(() => {
    cache.forEach(cached => {
      URL.revokeObjectURL(cached.url);
    });
    setCache(new Map());
  }, [cache]);

  const contextValue = useMemo(() => ({
    getCachedPhoto,
    setCachedPhoto,
    invalidatePhoto,
    clearCache
  }), [getCachedPhoto, setCachedPhoto, invalidatePhoto, clearCache]);

  return (
    <StudentPhotoContext.Provider value={contextValue}>
      {children}
    </StudentPhotoContext.Provider>
  );
}

/**
 * Hook to access student photo cache
 * @throws Error if used outside StudentPhotoProvider
 */
export function useStudentPhotoCache() {
  const context = useContext(StudentPhotoContext);
  if (!context) {
    throw new Error('useStudentPhotoCache must be used within StudentPhotoProvider');
  }
  return context;
}
