import { createContext, useContext, useCallback, useId, useMemo, useRef } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import * as styles from "./Tabs.css.js";

// --- Context ---

type TabsCtx = {
  activeValue: string;
  activate: (value: string) => void;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onTriggerFocus: (value: string) => void;
  getTriggerTabIndex: (value: string) => number;
  getContentId: (value: string) => string;
  getTriggerId: (value: string) => string;
};

const Ctx = createContext<TabsCtx>({
  activeValue: "",
  activate: () => {},
  registerTrigger: () => {},
  handleKeyDown: () => {},
  onTriggerFocus: () => {},
  getTriggerTabIndex: () => -1,
  getContentId: () => "",
  getTriggerId: () => "",
});

// --- Root ---

type RootProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Root({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  style,
  children,
}: RootProps) {
  const [activeValue, setActiveValue] = useControllableState(
    controlledValue,
    defaultValue,
    onValueChange,
  );
  const activate = setActiveValue;
  const baseId = useId();

  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderRef = useRef<string[]>([]);
  const focusedRef = useRef(0);

  const registerTrigger = useCallback((val: string, el: HTMLButtonElement | null) => {
    if (el) {
      triggersRef.current.set(val, el);
      if (!orderRef.current.includes(val)) orderRef.current.push(val);
    } else {
      triggersRef.current.delete(val);
      orderRef.current = orderRef.current.filter((v) => v !== val);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const triggers = orderRef.current;
      const count = triggers.length;
      if (count === 0) return;

      let next = focusedRef.current;

      if (e.key === "ArrowRight") next = (next + 1) % count;
      else if (e.key === "ArrowLeft") next = (next - 1 + count) % count;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = count - 1;
      else return;

      // Skip disabled triggers
      let el = triggersRef.current.get(triggers[next]);
      if (el?.disabled) {
        // For Home/End, find the nearest enabled trigger
        if (e.key === "End") {
          for (let i = next - 1; i >= 0; i--) {
            const candidate = triggersRef.current.get(triggers[i]);
            if (candidate && !candidate.disabled) {
              next = i;
              el = candidate;
              break;
            }
          }
        } else if (e.key === "Home") {
          for (let i = next + 1; i < count; i++) {
            const candidate = triggersRef.current.get(triggers[i]);
            if (candidate && !candidate.disabled) {
              next = i;
              el = candidate;
              break;
            }
          }
        } else {
          return;
        }
      }

      e.preventDefault();
      focusedRef.current = next;
      el?.focus();
      activate(triggers[next]);
    },
    [activate],
  );

  const onTriggerFocus = useCallback((val: string) => {
    const idx = orderRef.current.indexOf(val);
    if (idx >= 0) focusedRef.current = idx;
  }, []);

  const getTriggerTabIndex = useCallback(
    (val: string) => (val === activeValue ? 0 : -1),
    [activeValue],
  );

  const getContentId = useCallback((val: string) => `${baseId}-content-${val}`, [baseId]);
  const getTriggerId = useCallback((val: string) => `${baseId}-trigger-${val}`, [baseId]);

  const ctxValue = useMemo(
    () => ({
      activeValue,
      activate,
      registerTrigger,
      handleKeyDown,
      onTriggerFocus,
      getTriggerTabIndex,
      getContentId,
      getTriggerId,
    }),
    [
      activeValue,
      activate,
      registerTrigger,
      handleKeyDown,
      onTriggerFocus,
      getTriggerTabIndex,
      getContentId,
      getTriggerId,
    ],
  );

  return (
    <Ctx.Provider value={ctxValue}>
      <div className={className} style={style}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

// --- List ---

type ListProps = {
  className?: string;
  children?: React.ReactNode;
};

export function List({ className, children }: ListProps) {
  const cls = cn(styles.list, className);
  return (
    <div role="tablist" className={cls}>
      {children}
    </div>
  );
}

// --- Trigger ---

type TriggerProps = {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function Trigger({ value, disabled = false, className, children }: TriggerProps) {
  const {
    activeValue,
    activate,
    registerTrigger,
    handleKeyDown,
    onTriggerFocus,
    getTriggerTabIndex,
    getContentId,
    getTriggerId,
  } = useContext(Ctx);
  const isActive = activeValue === value;
  const cls = cn(styles.trigger, className);

  return (
    <button
      type="button"
      role="tab"
      id={getTriggerId(value)}
      ref={(el) => registerTrigger(value, el)}
      aria-selected={isActive}
      aria-controls={getContentId(value)}
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      tabIndex={getTriggerTabIndex(value)}
      className={cls}
      onClick={() => {
        if (!disabled) activate(value);
      }}
      onMouseDown={() => {
        if (!disabled) activate(value);
      }}
      onKeyDown={handleKeyDown}
      onFocus={() => onTriggerFocus(value)}
    >
      {children}
    </button>
  );
}

// --- Content ---

type ContentProps = {
  value: string;
  className?: string;
  children?: React.ReactNode;
};

export function Content({ value, className, children }: ContentProps) {
  const { activeValue, getContentId, getTriggerId } = useContext(Ctx);
  if (activeValue !== value) return null;

  const cls = cn(styles.content, className);

  return (
    <div
      role="tabpanel"
      id={getContentId(value)}
      aria-labelledby={getTriggerId(value)}
      className={cls}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
