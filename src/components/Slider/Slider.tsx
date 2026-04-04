import { createContext, useContext, useCallback, useRef } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import * as styles from "./Slider.css.js";

// --- Utilities ---

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number) {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

function linearScale(input: [number, number], output: [number, number]) {
  return (value: number) => {
    const ratio = (value - input[0]) / (input[1] - input[0]);
    return output[0] + ratio * (output[1] - output[0]);
  };
}

// --- Context ---

type SliderCtx = {
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  orientation: "horizontal" | "vertical";
  values: number[];
  onThumbValueChange: (index: number, value: number) => void;
  registerThumb: () => number;
  thumbCount: React.MutableRefObject<number>;
  trackRef: React.RefObject<HTMLDivElement | null>;
};

const Ctx = createContext<SliderCtx>({
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  orientation: "horizontal",
  values: [],
  onThumbValueChange: () => {},
  registerThumb: () => 0,
  thumbCount: { current: 0 },
  trackRef: { current: null },
});

// --- Root ---

type RootProps = {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
};

export function Root({
  value: controlledValue,
  defaultValue = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = "horizontal",
  className,
  children,
  "aria-label": ariaLabel,
}: RootProps) {
  const [values, setValues] = useControllableState(controlledValue, defaultValue, onValueChange);
  const thumbCount = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const onThumbValueChange = useCallback(
    (index: number, newValue: number) => {
      if (disabled) return;
      const clamped = clamp(snapToStep(newValue, min, step), min, max);
      const next = [...values];
      next[index] = clamped;
      // Ensure thumbs don't cross
      if (index > 0 && next[index] < next[index - 1]) next[index] = next[index - 1];
      if (index < next.length - 1 && next[index] > next[index + 1]) next[index] = next[index + 1];
      setValues(next);
    },
    [disabled, min, max, step, values, setValues],
  );

  const registerThumb = useCallback(() => {
    const idx = thumbCount.current;
    thumbCount.current += 1;
    return idx;
  }, []);

  return (
    <Ctx.Provider
      value={{
        min,
        max,
        step,
        disabled,
        orientation,
        values,
        onThumbValueChange,
        registerThumb,
        thumbCount,
        trackRef,
      }}
    >
      <span
        dir="ltr"
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={cn(styles.root, className)}
      >
        {children}
      </span>
    </Ctx.Provider>
  );
}

// --- Track ---

type TrackProps = { className?: string };

export function Track({ className }: TrackProps) {
  const { min, max, values, orientation, trackRef } = useContext(Ctx);

  // Calculate range fill
  const minPercent = values.length > 1 ? ((values[0] - min) / (max - min)) * 100 : 0;
  const maxPercent = ((values[values.length - 1] - min) / (max - min)) * 100;

  const rangeStyle: React.CSSProperties =
    orientation === "horizontal"
      ? { left: `${minPercent}%`, right: `${100 - maxPercent}%` }
      : { bottom: `${minPercent}%`, top: `${100 - maxPercent}%` };

  return (
    <span ref={trackRef} data-orientation={orientation} className={cn(styles.track, className)}>
      <span className={styles.range} style={rangeStyle} />
    </span>
  );
}

// --- Thumb ---

type ThumbProps = {
  className?: string;
  "aria-label"?: string;
};

export function Thumb({ className, "aria-label": ariaLabel }: ThumbProps) {
  const { min, max, step, disabled, orientation, values, onThumbValueChange, trackRef } =
    useContext(Ctx);

  // Each Thumb gets a stable index based on mount order
  const indexRef = useRef(-1);
  const { registerThumb } = useContext(Ctx);
  if (indexRef.current === -1) {
    indexRef.current = registerThumb();
  }
  const index = indexRef.current;

  const value = values[index] ?? min;
  const percent = ((value - min) / (max - min)) * 100;

  const posStyle: React.CSSProperties =
    orientation === "horizontal"
      ? { left: `${percent}%`, transform: "translateX(-50%)" }
      : { bottom: `${percent}%`, transform: "translateY(50%)" };

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      let newValue = value;
      const bigStep = step * 10;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = value + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = value - step;
          break;
        case "PageUp":
          newValue = value + bigStep;
          break;
        case "PageDown":
          newValue = value - bigStep;
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      onThumbValueChange(index, newValue);
    },
    [disabled, value, step, min, max, index, onThumbValueChange],
  );

  // Pointer drag handling
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      function getValueFromPointer(clientX: number, clientY: number) {
        const track = trackRef.current;
        if (!track) return value;
        const rect = track.getBoundingClientRect();

        if (orientation === "horizontal") {
          const scale = linearScale([0, rect.width], [min, max]);
          return scale(clientX - rect.left);
        } else {
          const scale = linearScale([0, rect.height], [max, min]);
          return scale(clientY - rect.top);
        }
      }

      function onPointerMove(ev: PointerEvent) {
        onThumbValueChange(index, getValueFromPointer(ev.clientX, ev.clientY));
      }

      function onPointerUp() {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
      }

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
    },
    [disabled, value, orientation, min, max, index, onThumbValueChange, trackRef],
  );

  return (
    <span
      role="slider"
      tabIndex={disabled ? undefined : 0}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-orientation={orientation}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-orientation={orientation}
      data-disabled={disabled ? "" : undefined}
      className={cn(styles.thumb, className)}
      style={{ position: "absolute", ...posStyle }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
    />
  );
}
