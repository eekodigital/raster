import { createContext, useContext, useEffect, useId, useMemo, useRef } from "react";
import type React from "react";
import { Portal as PortalComponent } from "../Portal/Portal.js";
import { cn } from "../../utils/cn.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useEscapeKey } from "../../utils/use-escape-key.js";
import { useFocusTrap } from "../../utils/use-focus-trap.js";
import * as styles from "./Dialog.css.js";

// --- Context ---

type DialogCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentId: string;
  titleId: string;
  descriptionId: string;
};

const Ctx = createContext<DialogCtx>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentId: "",
  titleId: "",
  descriptionId: "",
});

// --- Root ---

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
  const baseId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);

  const ctxValue = useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentId: `${baseId}-content`,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-desc`,
    }),
    [open, setOpen, triggerRef, baseId],
  );

  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
}

// --- Trigger ---

type TriggerProps = {
  children:
    | React.ReactNode
    | ((props: {
        ref: (el: HTMLElement | null) => void;
        onClick: () => void;
      }) => React.ReactElement);
};

export function Trigger({ children }: TriggerProps) {
  const { setOpen, triggerRef } = useContext(Ctx);

  const triggerProps = {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
    },
    onClick: () => setOpen(true),
  };

  if (typeof children === "function") {
    return children(triggerProps);
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

// --- Portal ---

export function Portal({ children }: { children: React.ReactNode }) {
  const { open } = useContext(Ctx);
  if (!open) return null;
  return <PortalComponent>{children}</PortalComponent>;
}

// --- Overlay ---

type OverlayProps = {
  className?: string;
};

export function Overlay({ className }: OverlayProps) {
  const { setOpen } = useContext(Ctx);
  const cls = cn(styles.overlay, className);

  return <div className={cls} data-state="open" onClick={() => setOpen(false)} />;
}

// --- Content ---

type ContentProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Content({ className, children }: ContentProps) {
  const { setOpen, triggerRef, contentId, titleId, descriptionId } = useContext(Ctx);
  const focusTrapRef = useFocusTrap(true);
  const cls = cn(styles.content, className);

  useEscapeKey(() => setOpen(false), true);

  // Scroll lock + focus restore to trigger
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
      triggerRef.current?.focus();
    };
  }, [triggerRef]);

  return (
    <div
      ref={focusTrapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      id={contentId}
      className={cls}
      data-state="open"
    >
      {children}
    </div>
  );
}

// --- Title ---

type TitleProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Title({ className, children }: TitleProps) {
  const { titleId } = useContext(Ctx);
  const cls = cn(styles.title, className);
  return (
    <h2 id={titleId} className={cls}>
      {children}
    </h2>
  );
}

// --- Description ---

type DescriptionProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Description({ className, children }: DescriptionProps) {
  const { descriptionId } = useContext(Ctx);
  const cls = cn(styles.description, className);
  return (
    <p id={descriptionId} className={cls}>
      {children}
    </p>
  );
}

// --- Close ---

type CloseProps = {
  className?: string;
  children?: React.ReactNode | ((props: { onClick: () => void }) => React.ReactElement);
  "aria-label"?: string;
};

export function Close({ className, children, "aria-label": ariaLabel }: CloseProps) {
  const { setOpen } = useContext(Ctx);
  const close = () => setOpen(false);

  if (typeof children === "function") {
    return children({ onClick: close });
  }

  const cls = cn(styles.close, className);
  return (
    <button type="button" className={cls} aria-label={ariaLabel} onClick={close}>
      {children}
    </button>
  );
}
