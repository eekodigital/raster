import { createContext, useContext, useCallback, useMemo, useRef } from "react";
import type React from "react";
import { Portal as PortalComponent } from "../Portal/Portal.js";
import { cn } from "../../utils/cn.js";
import { positionOverlay } from "../../utils/position-overlay.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useClickOutside } from "../../utils/use-click-outside.js";
import { useEscapeKey } from "../../utils/use-escape-key.js";
import * as styles from "./DropdownMenu.css.js";

// --- Contexts ---

type MenuCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const MenuCtx = createContext<MenuCtx>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

type RadioGroupCtx = {
  value: string;
  onValueChange: (value: string) => void;
};

const RadioGroupCtx = createContext<RadioGroupCtx>({
  value: "",
  onValueChange: () => {},
});

// --- Root ---

type RootProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export function Root({ open: controlledOpen, onOpenChange, children }: RootProps) {
  const [open, setOpen] = useControllableState(controlledOpen, false, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);

  const ctxValue = useMemo(() => ({ open, setOpen, triggerRef }), [open, setOpen, triggerRef]);

  return <MenuCtx.Provider value={ctxValue}>{children}</MenuCtx.Provider>;
}

// --- Trigger ---

type TriggerProps = {
  children:
    | React.ReactNode
    | ((props: {
        ref: (el: HTMLElement | null) => void;
        "aria-expanded": boolean;
        "aria-haspopup": "menu";
        onClick: () => void;
      }) => React.ReactElement);
};

export function Trigger({ children }: TriggerProps) {
  const { open, setOpen, triggerRef } = useContext(MenuCtx);

  const handleClick = useCallback(() => setOpen(!open), [open, setOpen]);

  const triggerProps = {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
    },
    "aria-expanded": open,
    "aria-haspopup": "menu" as const,
    onClick: handleClick,
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
  const { open } = useContext(MenuCtx);
  if (!open) return null;
  return <PortalComponent>{children}</PortalComponent>;
}

// --- Content ---

type ContentProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Content({ className, children }: ContentProps) {
  const { open, setOpen, triggerRef } = useContext(MenuCtx);

  if (!open) return null;

  return (
    <ContentInner className={className} setOpen={setOpen} triggerRef={triggerRef}>
      {children}
    </ContentInner>
  );
}

function ContentInner({
  className,
  children,
  setOpen,
  triggerRef,
}: {
  className?: string;
  children?: React.ReactNode;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const menuRef = useClickOutside(() => setOpen(false), true, [triggerRef]);
  const cls = cn(styles.content, className);

  // Escape to close
  useEscapeKey(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, true);

  // Arrow key navigation
  function handleMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]') ??
        [],
    );
    const currentIdx = items.indexOf(document.activeElement as HTMLElement);
    let next = currentIdx;

    if (e.key === "ArrowDown") next = (currentIdx + 1) % items.length;
    else if (e.key === "ArrowUp") next = (currentIdx - 1 + items.length) % items.length;

    items[next]?.focus();
  }

  // Position and focus via ref callback — runs when DOM is ready
  const positionAndFocus = useCallback(
    (menu: HTMLDivElement | null) => {
      if (!menu) return;
      // Attach to click-outside ref
      (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = menu;

      const trigger = triggerRef.current;
      if (!trigger) return;

      positionOverlay(trigger, menu, "bottom-end");
      const firstItem = menu.querySelector<HTMLElement>(
        '[role="menuitem"], [role="menuitemradio"]',
      );
      firstItem?.focus({ preventScroll: true });
    },
    [triggerRef, menuRef],
  );

  return (
    <div
      ref={positionAndFocus}
      role="menu"
      className={cls}
      data-state="open"
      onKeyDown={handleMenuKeyDown}
    >
      {children}
    </div>
  );
}

// --- Item ---

type ItemProps = {
  className?: string;
  inset?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function Item({ className, inset, onSelect, disabled, children }: ItemProps) {
  const { setOpen } = useContext(MenuCtx);
  const cls = cn(styles.item, inset && styles.itemInset, className);

  return (
    <div
      role="menuitem"
      className={cls}
      tabIndex={-1}
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        setOpen(false);
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (disabled) return;
          onSelect?.();
          setOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
}

// --- RadioGroup ---

type RadioGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
};

export function RadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <RadioGroupCtx.Provider value={{ value, onValueChange }}>
      <div role="group">{children}</div>
    </RadioGroupCtx.Provider>
  );
}

// --- RadioItem ---

type RadioItemProps = {
  className?: string;
  value: string;
  children?: React.ReactNode;
};

export function RadioItem({ className, value, children }: RadioItemProps) {
  const { setOpen } = useContext(MenuCtx);
  const { value: groupValue, onValueChange } = useContext(RadioGroupCtx);
  const checked = groupValue === value;
  const cls = cn(styles.radioItem, className);

  return (
    <div
      role="menuitemradio"
      aria-checked={checked}
      className={cls}
      tabIndex={-1}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onValueChange(value);
          setOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
}

// --- ItemIndicator ---

type ItemIndicatorProps = {
  className?: string;
  children?: React.ReactNode;
};

export function ItemIndicator({ className, children }: ItemIndicatorProps) {
  const cls = cn(styles.itemIndicator, className);
  // Only visible when parent is checked (CSS handles via data-state)
  return <span className={cls}>{children}</span>;
}

// --- Label ---

type LabelProps = {
  className?: string;
  inset?: boolean;
  children?: React.ReactNode;
};

export function Label({ className, inset, children }: LabelProps) {
  const cls = cn(styles.label, inset && styles.itemInset, className);
  return <div className={cls}>{children}</div>;
}

// --- Separator ---

type SeparatorProps = {
  className?: string;
};

export function Separator({ className }: SeparatorProps) {
  const cls = cn(styles.separator, className);
  return <div role="separator" className={cls} />;
}

// --- Sub (stub) ---

export function Sub({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
export function SubTrigger({
  children,
  className,
  inset,
}: {
  children?: React.ReactNode;
  className?: string;
  inset?: boolean;
}) {
  const cls = cn(styles.subTrigger, inset && styles.itemInset, className);
  return <div className={cls}>{children}</div>;
}
export function SubContent({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const cls = cn(styles.content, className);
  return <div className={cls}>{children}</div>;
}
export function Group({ children }: { children?: React.ReactNode }) {
  return <div role="group">{children}</div>;
}
export function CheckboxItem({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const cls = cn(styles.checkboxItem, className);
  return (
    <div role="menuitemcheckbox" className={cls}>
      {children}
    </div>
  );
}
