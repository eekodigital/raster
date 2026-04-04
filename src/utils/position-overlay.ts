export type Placement = 'top' | 'bottom-start' | 'bottom-end';

/**
 * Positions an overlay element relative to a trigger element.
 * Synchronous — safe to call in ref callbacks before paint.
 * Handles flip (switch side if overflow) and shift (slide to stay in viewport).
 */
export function positionOverlay(
  trigger: HTMLElement,
  overlay: HTMLElement,
  placement: Placement = 'bottom-start',
  gap = 4,
) {
  const triggerRect = trigger.getBoundingClientRect();
  const overlayWidth = overlay.offsetWidth || 160;
  const overlayHeight = overlay.offsetHeight || 40;

  // Calculate preferred position
  let top: number;
  let left: number;

  if (placement === 'top') {
    top = triggerRect.top - overlayHeight - gap;
    left = triggerRect.left + triggerRect.width / 2 - overlayWidth / 2;
  } else if (placement === 'bottom-end') {
    top = triggerRect.bottom + gap;
    left = triggerRect.right - overlayWidth;
  } else {
    top = triggerRect.bottom + gap;
    left = triggerRect.left;
  }

  // Flip: if overflows bottom, try top (and vice versa)
  if (placement !== 'top' && top + overlayHeight > window.innerHeight) {
    const flipped = triggerRect.top - overlayHeight - gap;
    if (flipped >= 0) top = flipped;
  } else if (placement === 'top' && top < 0) {
    const flipped = triggerRect.bottom + gap;
    if (flipped + overlayHeight <= window.innerHeight) top = flipped;
  }

  // Shift: keep within viewport horizontally
  left = Math.max(4, Math.min(left, window.innerWidth - overlayWidth - 4));

  Object.assign(overlay.style, {
    top: `${top}px`,
    left: `${left}px`,
  });
}
