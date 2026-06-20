/**
 * Viewport-aware positioning for the CSS `data-tooltip` tooltips.
 *
 * The tooltips are pure CSS pseudo-elements (`.tooltip-container::before`)
 * centered over their trigger with `left: 50%`. When the trigger sits close to
 * a screen edge, the centered bubble overflows off-screen and looks clipped.
 *
 * This module measures the rendered tooltip on interaction and writes a
 * `--tooltip-shift` CSS variable on the trigger, which the stylesheet adds to
 * the horizontal translate so the bubble is nudged back inside the viewport.
 */

/** Horizontal safety margin from the viewport edges, in pixels. */
const EDGE_MARGIN = 8;

/**
 * Compute and apply the horizontal shift needed to keep the tooltip of the
 * given trigger fully within the viewport.
 */
function positionTooltip(trigger: HTMLElement): void {
  if (!trigger.dataset.tooltip) return;

  // Reset before measuring so the previous shift doesn't skew the reading.
  trigger.style.setProperty('--tooltip-shift', '0px');

  const before = window.getComputedStyle(trigger, '::before');
  const contentWidth = parseFloat(before.width);
  if (!Number.isFinite(contentWidth) || contentWidth <= 0) return;

  // `width` is the content-box width; add padding and border to get the
  // full visual (border-box) width so the shift is accurate at the edges.
  const extra =
    (parseFloat(before.paddingLeft) || 0) +
    (parseFloat(before.paddingRight) || 0) +
    (parseFloat(before.borderLeftWidth) || 0) +
    (parseFloat(before.borderRightWidth) || 0);
  const tooltipWidth = contentWidth + extra;

  const rect = trigger.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const halfWidth = tooltipWidth / 2;
  const viewportWidth = document.documentElement.clientWidth;

  const leftEdge = center - halfWidth;
  const rightEdge = center + halfWidth;

  let shift = 0;
  if (rightEdge > viewportWidth - EDGE_MARGIN) {
    shift = viewportWidth - EDGE_MARGIN - rightEdge;
  } else if (leftEdge < EDGE_MARGIN) {
    shift = EDGE_MARGIN - leftEdge;
  }

  if (shift !== 0) {
    trigger.style.setProperty('--tooltip-shift', `${Math.round(shift)}px`);
  }
}

/**
 * Resolve the closest tooltip trigger from an event target, if any.
 */
function resolveTrigger(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const trigger = target.closest('.tooltip-container');
  return trigger instanceof HTMLElement ? trigger : null;
}

function handleInteraction(event: Event): void {
  const trigger = resolveTrigger(event.target);
  if (trigger) positionTooltip(trigger);
}

/**
 * Install global, delegated listeners that keep tooltips inside the viewport.
 * Safe to call once at app startup.
 */
export function initTooltipViewport(): void {
  if (typeof document === 'undefined') return;
  // Pointer + focus cover mouse, touch and keyboard interactions.
  document.addEventListener('pointerover', handleInteraction, { passive: true });
  document.addEventListener('focusin', handleInteraction);
}
