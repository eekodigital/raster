import { createContext, useContext, useEffect, useId, useMemo, useRef } from "react";
import type React from "react";
import { Portal as PortalComponent } from "../Portal/Portal.js";
import { cn } from "../../utils/cn.js";
import { Slot } from "../../utils/slot.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useEscapeKey } from "../../utils/use-escape-key.js";
import { useFocusTrap } from "../../utils/use-focus-trap.js";
import * as styles from "./AlertDialog.css.js";

type AlertDialogCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentId: string;
  titleId: string;
  descriptionId: string;
};

const Ctx = createContext<AlertDialogCtx>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentId: "",
  titleId: "",
  descriptionId: "",
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

type TriggerProps = { asChild?: boolean; children?: React.ReactNode };

export function Trigger({ asChild = false, children }: TriggerProps) {
  const { setOpen, triggerRef } = useContext(Ctx);

  const triggerProps = {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
    },
    onClick: () => setOpen(true),
  };

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>;
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

export function Portal({ children }: { children: React.ReactNode }) {
  const { open } = useContext(Ctx);
  if (!open) return null;
  return <PortalComponent>{children}</PortalComponent>;
}

type OverlayProps = { className?: string };

export function Overlay({ className }: OverlayProps) {
  const cls = cn(styles.overlay, className);
  // AlertDialog overlay does NOT close on click
  return <div className={cls} data-state="open" />;
}

type ContentProps = { className?: string; children?: React.ReactNode };

export function Content({ className, children }: ContentProps) {
  const { setOpen, triggerRef, contentId, titleId, descriptionId } = useContext(Ctx);
  const focusTrapRef = useFocusTrap(true);
  const cls = cn(styles.content, className);

  useEscapeKey(() => setOpen(false), true);

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
      role="alertdialog"
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

type TitleProps = { className?: string; children?: React.ReactNode };
export function Title({ className, children }: TitleProps) {
  const { titleId } = useContext(Ctx);
  const cls = cn(styles.title, className);
  return (
    <h2 id={titleId} className={cls}>
      {children}
    </h2>
  );
}

type DescriptionProps = { className?: string; children?: React.ReactNode };
export function Description({ className, children }: DescriptionProps) {
  const { descriptionId } = useContext(Ctx);
  const cls = cn(styles.description, className);
  return (
    <p id={descriptionId} className={cls}>
      {children}
    </p>
  );
}

type ActionProps = {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};
export function Action({ asChild = false, className, children, onClick }: ActionProps) {
  const { setOpen } = useContext(Ctx);
  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };

  if (asChild) {
    return <Slot onClick={handleClick}>{children}</Slot>;
  }

  const cls = cn(styles.action, className);
  return (
    <button type="button" className={cls} onClick={handleClick}>
      {children}
    </button>
  );
}

type CancelProps = {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};
export function Cancel({ asChild = false, className, children, onClick }: CancelProps) {
  const { setOpen } = useContext(Ctx);
  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };

  if (asChild) {
    return <Slot onClick={handleClick}>{children}</Slot>;
  }

  const cls = cn(styles.cancel, className);
  return (
    <button type="button" className={cls} onClick={handleClick}>
      {children}
    </button>
  );
}
