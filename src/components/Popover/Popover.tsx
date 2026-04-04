import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type React from 'react';
import { cn } from '../../utils/cn.js';
import { positionOverlay } from '../../utils/position-overlay.js';
import { useControllableState } from '../../utils/use-controllable-state.js';
import { useClickOutside } from '../../utils/use-click-outside.js';
import { useEscapeKey } from '../../utils/use-escape-key.js';
import * as styles from './Popover.css.js';

type PopoverCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentId: string;
};

const Ctx = createContext<PopoverCtx>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentId: '',
});

type RootProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export function Root({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
}: RootProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();

  const ctxValue = useMemo(
    () => ({ open, setOpen, triggerRef, contentId }),
    [open, setOpen, triggerRef, contentId],
  );

  return (
    <Ctx.Provider value={ctxValue}>
      <div style={{ position: 'relative', display: 'inline-block' }}>{children}</div>
    </Ctx.Provider>
  );
}

type TriggerProps = { children: React.ReactNode };

export function Trigger({ children }: TriggerProps) {
  const { open, setOpen, triggerRef } = useContext(Ctx);
  return (
    <button
      type="button"
      ref={(el) => {
        triggerRef.current = el;
      }}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
    >
      {children}
    </button>
  );
}

export function Portal({ children }: { children: React.ReactNode }) {
  const { open } = useContext(Ctx);
  if (!open) return null;
  return <>{children}</>;
}

export function Anchor(_props: { children?: React.ReactNode }) {
  return null;
}

type ContentProps = { className?: string; children?: React.ReactNode; sideOffset?: number };

export function Content({ className, children }: ContentProps) {
  const { open, setOpen, triggerRef, contentId } = useContext(Ctx);

  if (!open) return null;

  return (
    <ContentInner
      className={className}
      contentId={contentId}
      setOpen={setOpen}
      triggerRef={triggerRef}
    >
      {children}
    </ContentInner>
  );
}

// Inner component so hooks run only when mounted (open)
function ContentInner({
  className,
  children,
  contentId,
  setOpen,
  triggerRef,
}: {
  className?: string;
  children?: React.ReactNode;
  contentId: string;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const contentRef = useClickOutside(() => setOpen(false), true, [triggerRef]);
  const cls = cn(styles.content, className);

  // Escape to close
  useEscapeKey(() => setOpen(false), true);

  // Focus restore on unmount
  useEffect(() => {
    return () => {
      triggerRef.current?.focus();
    };
  }, [triggerRef]);

  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Position and focus via ref callback
  const positionAndFocus = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;

      const trigger = triggerRef.current;
      if (!trigger) return;

      positionOverlay(trigger, el, 'bottom-start');
      const first = el.querySelector<HTMLElement>(focusableSelector);
      first?.focus({ preventScroll: true });
    },
    [triggerRef, contentRef],
  );

  return (
    <div ref={positionAndFocus} id={contentId} className={cls} data-state="open">
      {children}
    </div>
  );
}

export function Arrow(_props: { className?: string }) {
  return null;
}

type CloseProps = { className?: string; children?: React.ReactNode };

export function Close({ className, children }: CloseProps) {
  const { setOpen } = useContext(Ctx);
  const cls = cn(styles.close, className);
  return (
    <button type="button" className={cls} onClick={() => setOpen(false)}>
      {children}
    </button>
  );
}
