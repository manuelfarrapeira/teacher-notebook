import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

/**
 * Props for PortalTooltip
 */
interface PortalTooltipProps {
  /** Tooltip text to display */
  readonly text: string;
  /** Content to wrap (the trigger element) */
  readonly children: React.ReactNode;
  /** Position of the tooltip relative to the trigger */
  readonly position?: 'top' | 'bottom';
  /**
   * HTML tag for the trigger wrapper.
   * Use 'span' when wrapping interactive elements (e.g. buttons) to avoid invalid nesting.
   */
  readonly as?: 'button' | 'span';
}

/**
 * Tooltip that renders via a React portal so it escapes any overflow/stacking context.
 * Uses the same CSS classes as the eval-criteria tooltip system.
 *
 * @example
 * <PortalTooltip text="Download file" as="span">
 *   <button onClick={handleDownload}><Download size={16} /></button>
 * </PortalTooltip>
 */
export function PortalTooltip({ text, children, position = 'top', as = 'button' }: PortalTooltipProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = position === 'bottom' ? rect.bottom + 8 : rect.top - 8;
    setCoords({ top, left });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  const Tag = as;

  return (
    <>
      <Tag
        ref={triggerRef as React.RefObject<HTMLButtonElement & HTMLSpanElement>}
        className="eval-criteria-tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
        {...(as === 'button' ? { type: 'button' as const } : {})}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {children}
      </Tag>
      {visible && ReactDOM.createPortal(
        <div
          className="eval-criteria-tooltip-popup"
          style={{
            top: coords.top,
            left: coords.left,
            transform: position === 'bottom'
              ? 'translateX(-50%)'
              : 'translate(-50%, -100%)',
          }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}

