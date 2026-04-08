import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { StudentService, Gender } from '../../infrastructure/api/StudentService';
import { useStudentPhotoCache } from '../../contexts/StudentPhotoContext';
import silhouetteBoy from '../../images/shiluetas/niño.png';
import silhouetteGirl from '../../images/shiluetas/niña.png';

/** Default silhouette paths based on gender */
const DEFAULT_SILHOUETTES: Record<Gender, string> = {
  M: silhouetteBoy,
  F: silhouetteGirl,
};

interface StudentPhotoProps {
  studentId: number;
  photoFileName: string | null;
  /** Gender of the student, used to pick the default silhouette */
  gender: Gender;
  size?: number;
  alt?: string;
}

export function StudentPhoto({
  studentId,
  photoFileName,
  gender,
  size = 64,
  alt = 'Student photo'
}: Readonly<StudentPhotoProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getCachedPhoto, setCachedPhoto, getCacheVersion } = useStudentPhotoCache();

  /** Track the invalidation version for this specific student */
  const cacheVersion = getCacheVersion(studentId);

  useEffect(() => {
    if (!photoFileName) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [photoFileName]);

  useEffect(() => {
    if (!isVisible || !photoFileName) return;

    // Check cache first (stable function, reads from ref)
    const cachedUrl = getCachedPhoto(studentId);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      setError(false);
      return;
    }

    let cancelled = false;

    const loadPhoto = async () => {
      try {
        setLoading(true);
        setError(false);
        setImageUrl(null);

        const url = StudentService.getPhotoUrl(studentId);

        const response = await fetch(url, {
          headers: StudentService.buildHeaders(),
        });

        if (!response.ok) throw new Error('Photo load failed');
        if (cancelled) return;

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        setCachedPhoto(studentId, objectUrl);
        setImageUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading student photo:', err);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [isVisible, photoFileName, studentId, cacheVersion, getCachedPhoto, setCachedPhoto]);

  return (
    <div
      className="student-photo-container"
      style={{ width: size }}
      ref={containerRef}
    >
      {loading && <Loader2 className="animate-spin" size={size * 0.4} />}
      {(error || !photoFileName) && !loading && (
        <img
          src={DEFAULT_SILHOUETTES[gender]}
          alt={alt}
        />
      )}
      {imageUrl && !loading && !error && <img src={imageUrl} alt={alt} />}
    </div>
  );
}
