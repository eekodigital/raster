import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type React from "react";
import { Portal as PortalComponent } from "../Portal/Portal.js";
import { cn } from "../../utils/cn.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import * as styles from "./Toast.css.js";

// --- Provider ---

type ToastCtx = {
  toasts: Set<string>;
  register: (id: string) => void;
  unregister: (id: string) => void;
};

const Ctx = createContext<ToastCtx>({
  toasts: new Set(),
  register: () => {},
  unregister: () => {},
});

type ProviderProps = {
  swipeDirection?: "right" | "left" | "up" | "down";
  children?: React.ReactNode;
};

export function Provider({ children }: ProviderProps) {
  const toastsRef = useRef(new Set<string>());
  const register = useCallback((id: string) => {
    toastsRef.current.add(id);
  }, []);
  const unregister = useCallback((id: string) => {
    toastsRef.current.delete(id);
  }, []);

  return (
    <Ctx.Provider value={{ toasts: toastsRef.current, register, unregister }}>
      {children}
    </Ctx.Provider>
  );
}

// --- Viewport ---

type ViewportProps = {
  className?: string;
};

export function Viewport({ className }: ViewportProps) {
  const cls = cn(styles.viewport, className);
  return (
    <PortalComponent>
      <div className={cls} />
    </PortalComponent>
  );
}

// --- Root ---

type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  className?: string;
  children?: React.ReactNode;
};

export function Root({
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  duration = 5000,
  className,
  children,
}: RootProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen, onOpenChange);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open || duration === Infinity) return;
    timerRef.current = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(timerRef.current);
  }, [open, duration, setOpen]);

  if (!open) return null;

  const cls = cn(styles.root, className);

  return (
    <ToastInternalCtx.Provider value={{ setOpen }}>
      <div role="status" aria-live="polite" className={cls} data-state="open">
        {children}
      </div>
    </ToastInternalCtx.Provider>
  );
}

type ToastInternalCtx = { setOpen: (open: boolean) => void };
const ToastInternalCtx = createContext<ToastInternalCtx>({ setOpen: () => {} });

// --- Title ---

type TitleProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Title({ className, children }: TitleProps) {
  const cls = cn(styles.title, className);
  return <div className={cls}>{children}</div>;
}

// --- Description ---

type DescriptionProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Description({ className, children }: DescriptionProps) {
  const cls = cn(styles.description, className);
  return <div className={cls}>{children}</div>;
}

// --- Action ---

type ActionProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

export function Action({ className, children, onClick }: ActionProps) {
  const cls = cn(styles.action, className);
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

// --- Close ---

type CloseProps = {
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
};

export function Close({ className, children, "aria-label": ariaLabel }: CloseProps) {
  const { setOpen } = useContext(ToastInternalCtx);
  const cls = cn(styles.close, className);
  return (
    <button type="button" className={cls} aria-label={ariaLabel} onClick={() => setOpen(false)}>
      {children}
    </button>
  );
}
