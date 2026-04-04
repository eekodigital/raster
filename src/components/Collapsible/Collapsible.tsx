import { createContext, useContext, useCallback, useId, useMemo } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import * as styles from "./Collapsible.css.js";

type CollapsibleContext = {
  open: boolean;
  toggle: () => void;
  contentId: string;
};

const Ctx = createContext<CollapsibleContext>({ open: false, toggle: () => {}, contentId: "" });

type RootProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Root({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  style,
  children,
}: RootProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen, onOpenChange);
  const contentId = useId();

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  const ctxValue = useMemo(() => ({ open, toggle, contentId }), [open, toggle, contentId]);

  return (
    <Ctx.Provider value={ctxValue}>
      <div
        className={cn(styles.root, className)}
        style={style}
        data-state={open ? "open" : "closed"}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

interface TriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function Trigger({ children, className }: TriggerProps) {
  const { open, toggle, contentId } = useContext(Ctx);
  return (
    <button
      type="button"
      className={cn(styles.trigger, className)}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? "open" : "closed"}
      onClick={toggle}
    >
      {children}
      <svg
        className={styles.chevron}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Content({ children, className }: ContentProps) {
  const { open, contentId } = useContext(Ctx);
  if (!open) return null;

  return (
    <div id={contentId} className={cn(styles.content, className)} data-state="open" role="region">
      <div className={styles.contentInner}>{children}</div>
    </div>
  );
}
