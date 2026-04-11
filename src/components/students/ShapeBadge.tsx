import React from 'react';
import type { Shape } from '../../domain/models';

interface ShapeBadgeProps {
  /** The shape type to render */
  shape?: Shape;
}

/** Shape-to-SVG configuration map */
const SHAPE_CONFIG: Record<string, { label: string; element: React.ReactNode }> = {
  CIRCLE: {
    label: 'Circle',
    element: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" fill="#ef4444" stroke="#000" strokeWidth="0.8" />
      </svg>
    ),
  },
  TRIANGLE: {
    label: 'Triangle',
    element: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,3 22,21 2,21" fill="#3b82f6" stroke="#000" strokeWidth="0.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  SQUARE: {
    label: 'Square',
    element: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" stroke="#000" strokeWidth="0.8" />
      </svg>
    ),
  },
};

/**
 * Renders a colored shape badge for a student (optional visual identifier)
 */
export function ShapeBadge({ shape }: Readonly<ShapeBadgeProps>) {
  if (!shape) return null;

  const config = SHAPE_CONFIG[shape];
  if (!config) return null;

  return (
    <span className="student-shape-badge" aria-label={config.label}>
      {config.element}
    </span>
  );
}

