import { createContext, useContext, useState, useCallback, useId, useMemo, useRef } from 'react';
import type React from 'react';
import { cn } from '../../utils/cn.js';
import * as styles from './Accordion.css.js';

// --- Context ---

type AccordionCtx = {
  openItems: Set<string>;
  toggle: (value: string) => void;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  getTriggerTabIndex: (value: string) => number;
  onTriggerFocus: (value: string) => void;
};

const Ctx = createContext<AccordionCtx>({
  openItems: new Set(),
  toggle: () => {},
  registerTrigger: () => {},
  handleKeyDown: () => {},
  getTriggerTabIndex: () => -1,
  onTriggerFocus: () => {},
});

type ItemCtx = { value: string; contentId: string };
const ItemCtx = createContext<ItemCtx>({ value: '', contentId: '' });

// --- Root ---

type RootProps = {
  type: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Root({
  type,
  collapsible = false,
  defaultValue,
  value,
  onValueChange,
  className,
  style,
  children,
}: RootProps) {
  const controlled = value !== undefined;
  const [internalItems, setInternalItems] = useState<Set<string>>(() =>
    defaultValue
      ? new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
      : new Set<string>(),
  );
  const openItems = controlled
    ? new Set(Array.isArray(value) ? value : value ? [value] : [])
    : internalItems;
  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderRef = useRef<string[]>([]);
  const focusedRef = useRef(0);

  const toggle = useCallback(
    (itemValue: string) => {
      const prev = controlled
        ? new Set(Array.isArray(value) ? value : value ? [value] : [])
        : internalItems;
      const next = new Set(prev);
      if (next.has(itemValue)) {
        if (type === 'single' && !collapsible) return;
        next.delete(itemValue);
      } else {
        if (type === 'single') next.clear();
        next.add(itemValue);
      }

      if (!controlled) {
        setInternalItems(next);
      }

      if (type === 'single') {
        onValueChange?.(next.size > 0 ? [...next][0] : '');
      } else {
        onValueChange?.([...next]);
      }
    },
    [type, collapsible, controlled, value, internalItems, onValueChange],
  );

  const registerTrigger = useCallback((value: string, el: HTMLButtonElement | null) => {
    if (el) {
      triggersRef.current.set(value, el);
      if (!orderRef.current.includes(value)) orderRef.current.push(value);
    } else {
      triggersRef.current.delete(value);
      orderRef.current = orderRef.current.filter((v) => v !== value);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const triggers = orderRef.current;
    const count = triggers.length;
    if (count === 0) return;

    let next = focusedRef.current;

    if (e.key === 'ArrowDown') next = (next + 1) % count;
    else if (e.key === 'ArrowUp') next = (next - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    else return;

    e.preventDefault();
    focusedRef.current = next;
    triggersRef.current.get(triggers[next])?.focus();
  }, []);

  const getTriggerTabIndex = useCallback((value: string) => {
    const idx = orderRef.current.indexOf(value);
    return idx === focusedRef.current ? 0 : -1;
  }, []);

  const onTriggerFocus = useCallback((value: string) => {
    const idx = orderRef.current.indexOf(value);
    if (idx >= 0) focusedRef.current = idx;
  }, []);

  const cls = cn(styles.root, className);

  const ctxValue = useMemo(
    () => ({
      openItems,
      toggle,
      registerTrigger,
      handleKeyDown,
      getTriggerTabIndex,
      onTriggerFocus,
    }),
    [openItems, toggle, registerTrigger, handleKeyDown, getTriggerTabIndex, onTriggerFocus],
  );

  return (
    <Ctx.Provider value={ctxValue}>
      <div className={cls} style={style}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

// --- Item ---

type ItemProps = {
  value: string;
  className?: string;
  children?: React.ReactNode;
};

export function Item({ value, className, children }: ItemProps) {
  const contentId = useId();
  const { openItems } = useContext(Ctx);
  const isOpen = openItems.has(value);
  const cls = cn(styles.item, className);

  return (
    <ItemCtx.Provider value={{ value, contentId }}>
      <div className={cls} data-state={isOpen ? 'open' : 'closed'}>
        {children}
      </div>
    </ItemCtx.Provider>
  );
}

// --- Header ---

export function Header({ children }: { children: React.ReactNode }) {
  return <h3 style={{ margin: 0 }}>{children}</h3>;
}

// --- Trigger ---

type TriggerProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Trigger({ className, children }: TriggerProps) {
  const { openItems, toggle, registerTrigger, handleKeyDown, getTriggerTabIndex, onTriggerFocus } =
    useContext(Ctx);
  const { value, contentId } = useContext(ItemCtx);
  const isOpen = openItems.has(value);
  const cls = cn(styles.trigger, className);

  return (
    <button
      type="button"
      ref={(el) => registerTrigger(value, el)}
      className={cls}
      aria-expanded={isOpen}
      aria-controls={contentId}
      data-state={isOpen ? 'open' : 'closed'}
      tabIndex={getTriggerTabIndex(value)}
      onClick={() => toggle(value)}
      onKeyDown={handleKeyDown}
      onFocus={() => onTriggerFocus(value)}
    >
      {children}
    </button>
  );
}

// --- Content ---

type ContentProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Content({ className, children }: ContentProps) {
  const { openItems } = useContext(Ctx);
  const { value, contentId } = useContext(ItemCtx);
  const isOpen = openItems.has(value);

  if (!isOpen) return null;

  const cls = cn(styles.content, className);

  return (
    <div id={contentId} className={cls} role="region" data-state="open">
      {children}
    </div>
  );
}
