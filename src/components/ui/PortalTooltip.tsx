import React, { useState, useRef, useLayoutEffect } from 'react';
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

/** Minimum gap between tooltip edge and viewport edge */
const MARGIN = 8;

/**
 * Tooltip that renders via a React portal so it escapes any overflow/stacking context.
 * Uses the same CSS classes as the eval-criteria tooltip system.
 * Automatically clamps horizontal position so the tooltip never overflows the viewport.
 */
export function PortalTooltip({ text, children, position = 'top', as = 'button' }: PortalTooltipProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});

  /**
   * After the portal tooltip is in the DOM, measure it and clamp to viewport.
   * useLayoutEffect runs synchronously before the browser paints.
   */
  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tipEl = tooltipRef.current;
    const tipWidth = tipEl.offsetWidth;
    const vw = window.innerWidth;

    const centerX = triggerRect.left + triggerRect.width / 2;
    const top = position === 'bottom' ? triggerRect.bottom + 8 : triggerRect.top - 8;

    // Calculate ideal left (centered)
    let left = centerX - tipWidth / 2;

    // Clamp so tooltip stays within viewport
    if (left + tipWidth > vw - MARGIN) {
      left = vw - MARGIN - tipWidth;
    }
    if (left < MARGIN) {
      left = MARGIN;
    }

    setStyle({
      top,
      left,
      transform: position === 'bottom' ? 'none' : 'translateY(-100%)',
    });
  }, [visible, text, position]);

  const show = () => setVisible(true);
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
          ref={tooltipRef}
          className="eval-criteria-tooltip-popup"
          style={style}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}

