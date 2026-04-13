import { createContext, useContext, useCallback, useEffect, useMemo, useRef } from "react";
import type React from "react";
import { Portal as PortalComponent } from "../Portal/Portal.js";
import { cn } from "../../utils/cn.js";
import { positionOverlay } from "../../utils/position-overlay.js";
import { Slot } from "../../utils/slot.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useEscapeKey } from "../../utils/use-escape-key.js";
import * as styles from "./Tooltip.css.js";

// --- Provider ---

type ProviderProps = {
  delayDuration?: number;
  children?: React.ReactNode;
};

const DelayCtx = createContext(700);

export function Provider({ delayDuration = 700, children }: ProviderProps) {
  return <DelayCtx.Provider value={delayDuration}>{children}</DelayCtx.Provider>;
}

// --- Root ---

type TooltipCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  delayDuration: number;
};

const Ctx = createContext<TooltipCtx>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  delayDuration: 700,
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
  const delayDuration = useContext(DelayCtx);
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);

  const ctxValue = useMemo(
    () => ({ open, setOpen, triggerRef, delayDuration }),
    [open, setOpen, triggerRef, delayDuration],
  );

  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
}

// --- Trigger ---

type TriggerProps = { asChild?: boolean; children?: React.ReactNode };

export function Trigger({ asChild = false, children }: TriggerProps) {
  const { setOpen, triggerRef, delayDuration } = useContext(Ctx);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    if (delayDuration > 0) {
      timerRef.current = setTimeout(() => setOpen(true), delayDuration);
    } else {
      setOpen(true);
    }
  }, [delayDuration, setOpen]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setOpen(false);
  }, [setOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const triggerProps = {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
    },
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: () => setOpen(true),
    onBlur: hide,
  };

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>;
  }

  return (
    <span tabIndex={0} {...triggerProps}>
      {children}
    </span>
  );
}

// --- Portal ---

export function Portal({ children }: { children: React.ReactNode }) {
  const { open } = useContext(Ctx);
  if (!open) return null;
  return <PortalComponent>{children}</PortalComponent>;
}

// --- Content ---

type ContentProps = {
  className?: string;
  sideOffset?: number;
  children?: React.ReactNode;
};

export function Content({ className, children }: ContentProps) {
  const { open, setOpen, triggerRef } = useContext(Ctx);

  useEscapeKey(() => setOpen(false), open);

  const positionTooltip = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const trigger = triggerRef.current;
      if (!trigger) return;
      positionOverlay(trigger, el, "top", 6);
    },
    [triggerRef],
  );

  if (!open) return null;

  const cls = cn(styles.content, className);

  return (
    <div ref={positionTooltip} role="tooltip" className={cls}>
      {children}
    </div>
  );
}

// --- Arrow (decorative) ---

type ArrowProps = {
  className?: string;
};

export function Arrow({ className }: ArrowProps) {
  const cls = cn(styles.arrow, className);
  return (
    <svg className={cls} width="10" height="5" viewBox="0 0 10 5" aria-hidden="true">
      <polygon points="0,0 5,5 10,0" fill="currentColor" />
    </svg>
  );
}
