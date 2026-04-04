import { useRef, useState, useCallback, useEffect } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
import * as styles from "./ScrollArea.css.js";

// --- Root ---

type RootProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  type?: "auto" | "always" | "scroll" | "hover";
  scrollHideDelay?: number;
};

export function Root({
  className,
  style,
  children,
  type = "hover",
  scrollHideDelay = 600,
}: RootProps) {
  return (
    <div
      className={cn(styles.root, className)}
      style={style}
      data-scroll-type={type}
      data-scroll-hide-delay={scrollHideDelay}
    >
      {children}
    </div>
  );
}

// --- Viewport ---

type ViewportProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export function Viewport({ className, style, children }: ViewportProps) {
  return (
    <div
      className={cn(styles.viewport, className)}
      style={{ overflow: "scroll", scrollbarWidth: "none", ...style }}
    >
      {children}
    </div>
  );
}

// --- Scrollbar ---

type ScrollbarProps = {
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function Scrollbar({ orientation = "vertical", className }: ScrollbarProps) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbSize, setThumbSize] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Find the viewport sibling
  const getViewport = useCallback(() => {
    return scrollbarRef.current?.parentElement?.querySelector(
      `.${styles.viewport}`,
    ) as HTMLElement | null;
  }, []);

  // Calculate thumb dimensions from viewport scroll state
  const updateThumb = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;

    if (orientation === "vertical") {
      const ratio = viewport.clientHeight / viewport.scrollHeight;
      if (ratio >= 1) {
        setThumbSize(0);
        return;
      }
      const trackHeight = scrollbarRef.current?.clientHeight ?? 0;
      setThumbSize(Math.max(ratio * trackHeight, 20));
      const scrollRatio = viewport.scrollTop / (viewport.scrollHeight - viewport.clientHeight);
      setThumbOffset(scrollRatio * (trackHeight - Math.max(ratio * trackHeight, 20)));
    } else {
      const ratio = viewport.clientWidth / viewport.scrollWidth;
      if (ratio >= 1) {
        setThumbSize(0);
        return;
      }
      const trackWidth = scrollbarRef.current?.clientWidth ?? 0;
      setThumbSize(Math.max(ratio * trackWidth, 20));
      const scrollRatio = viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
      setThumbOffset(scrollRatio * (trackWidth - Math.max(ratio * trackWidth, 20)));
    }
  }, [orientation, getViewport]);

  // Show/hide based on type
  const showScrollbar = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    setVisible(true);
    updateThumb();
  }, [updateThumb]);

  const scheduleHide = useCallback(() => {
    const root = scrollbarRef.current?.parentElement;
    const type = root?.getAttribute("data-scroll-type") ?? "hover";
    const delay = Number(root?.getAttribute("data-scroll-hide-delay") ?? 600);

    if (type === "always") return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), delay);
  }, []);

  // Listen to viewport scroll events
  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;

    function onScroll() {
      updateThumb();
      const root = scrollbarRef.current?.parentElement;
      const type = root?.getAttribute("data-scroll-type") ?? "hover";
      if (type === "scroll" || type === "auto") {
        showScrollbar();
        scheduleHide();
      }
    }

    viewport.addEventListener("scroll", onScroll, { passive: true });
    // Initial measurement
    updateThumb();

    const root = scrollbarRef.current?.parentElement;
    const type = root?.getAttribute("data-scroll-type") ?? "hover";
    if (type === "always") setVisible(true);

    // Observe resize
    const observer = new ResizeObserver(() => updateThumb());
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      observer.disconnect();
      clearTimeout(hideTimerRef.current);
    };
  }, [getViewport, updateThumb, showScrollbar, scheduleHide]);

  // Hover show/hide
  useEffect(() => {
    const root = scrollbarRef.current?.parentElement;
    if (!root) return;
    const type = root.getAttribute("data-scroll-type") ?? "hover";
    if (type !== "hover" && type !== "auto") return;

    function onEnter() {
      showScrollbar();
    }
    function onLeave() {
      scheduleHide();
    }

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [showScrollbar, scheduleHide]);

  // Thumb drag
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      const viewport = getViewport();
      if (!viewport) return;

      const startPos = orientation === "vertical" ? e.clientY : e.clientX;
      const startScroll = orientation === "vertical" ? viewport.scrollTop : viewport.scrollLeft;

      function onPointerMove(ev: PointerEvent) {
        const delta = (orientation === "vertical" ? ev.clientY : ev.clientX) - startPos;
        const trackSize =
          orientation === "vertical"
            ? (scrollbarRef.current?.clientHeight ?? 0)
            : (scrollbarRef.current?.clientWidth ?? 0);
        const scrollSize =
          orientation === "vertical"
            ? viewport!.scrollHeight - viewport!.clientHeight
            : viewport!.scrollWidth - viewport!.clientWidth;
        const scrollDelta = (delta / (trackSize - thumbSize)) * scrollSize;

        if (orientation === "vertical") {
          viewport!.scrollTop = startScroll + scrollDelta;
        } else {
          viewport!.scrollLeft = startScroll + scrollDelta;
        }
      }

      function onPointerUp() {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
      }

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
    },
    [orientation, getViewport, thumbSize],
  );

  const thumbStyle: React.CSSProperties =
    orientation === "vertical"
      ? { height: `${thumbSize}px`, transform: `translateY(${thumbOffset}px)` }
      : { width: `${thumbSize}px`, transform: `translateX(${thumbOffset}px)` };

  const scrollbarStyle: React.CSSProperties = {
    position: "absolute",
    ...(orientation === "vertical"
      ? { top: 0, right: 0, bottom: 0 }
      : { bottom: 0, left: 0, right: 0 }),
    opacity: visible ? 1 : 0,
    transition: "opacity var(--duration-fast) var(--easing-ease)",
  };

  // Always render so the ref is attached and the useEffect can measure the viewport.
  // When content doesn't overflow, keep the element in the DOM but invisible.
  const noOverflow = thumbSize === 0;

  return (
    <div
      ref={scrollbarRef}
      data-orientation={orientation}
      className={cn(styles.scrollbar, className)}
      style={{
        ...scrollbarStyle,
        opacity: thumbSize > 0 && visible ? 1 : 0,
        pointerEvents: noOverflow ? "none" : undefined,
      }}
    >
      {thumbSize > 0 && (
        <div
          ref={thumbRef}
          className={styles.thumb}
          style={thumbStyle}
          onPointerDown={handlePointerDown}
        />
      )}
    </div>
  );
}

// --- Corner ---

export function Corner() {
  return <div className={styles.corner} />;
}
