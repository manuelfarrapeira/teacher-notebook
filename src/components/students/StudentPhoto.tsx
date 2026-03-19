import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { StudentService, Gender } from '../../services/StudentService';
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
  const { getCachedPhoto, setCachedPhoto } = useStudentPhotoCache();

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

    const cachedUrl = getCachedPhoto(studentId);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      return;
    }

    const loadPhoto = async () => {
      try {
        setLoading(true);
        setError(false);

        const url = StudentService.getPhotoUrl(studentId);

        const response = await fetch(url, {
          headers: StudentService.buildHeaders(),
        });

        if (!response.ok) throw new Error('Photo load failed');

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        setCachedPhoto(studentId, objectUrl);
        setImageUrl(objectUrl);
      } catch (err) {
        console.error('Error loading student photo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [isVisible, photoFileName, studentId, getCachedPhoto, setCachedPhoto]);

  useEffect(() => {
    return () => {
      if (imageUrl && !getCachedPhoto(studentId)) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl, studentId, getCachedPhoto]);

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
