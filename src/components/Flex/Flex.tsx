import { useId } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { baseValue, isResponsive, resolveResponsive } from "../../utils/responsive.js";
import type { ResponsiveValue } from "../../utils/responsive.js";
import * as styles from "./Flex.css.js";

type Space =
  | "1"
  | "1-5"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "10"
  | "12"
  | "16"
  | "20"
  | "24";
type Direction = "row" | "column";
type Align = "start" | "center" | "end" | "baseline" | "stretch";
type Justify = "start" | "center" | "end" | "between" | "around";

const ALIGN_MAP: Record<Align, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  baseline: "baseline",
  stretch: "stretch",
};

const JUSTIFY_MAP: Record<Justify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

type FlexProps = {
  children: ReactNode;
  direction?: ResponsiveValue<Direction>;
  gap?: ResponsiveValue<Space>;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

export function Flex({
  children,
  direction = "row",
  gap = "4",
  align = "stretch",
  justify = "start",
  wrap = false,
  as: Tag = "div",
  className,
  style: styleProp,
}: FlexProps) {
  const dirResponsive = isResponsive(direction);
  const gapResponsive = isResponsive(gap);
  const hasResponsive = dirResponsive || gapResponsive;

  const baseDir = (dirResponsive ? baseValue(direction) : direction) as Direction;
  const baseGap = (gapResponsive ? baseValue(gap) : gap) as Space;

  // Static path — use vanilla-extract classes
  if (!hasResponsive) {
    const cls = [
      styles.base,
      styles.directions[baseDir],
      styles.gaps[baseGap],
      styles.alignments[align],
      styles.justifications[justify],
      wrap ? styles.wrapping.wrap : styles.wrapping.nowrap,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Tag className={cls} style={styleProp}>
        {children}
      </Tag>
    );
  }

  // Responsive path — use inline styles + injected media queries
  const id = useId();
  const mediaParts: string[] = [];
  const inlineVars: Record<string, string> = {};

  if (dirResponsive) {
    for (const { minWidth, value } of resolveResponsive(direction)) {
      if (minWidth === 0) {
        inlineVars["--flex-dir"] = String(value);
      } else {
        mediaParts.push(
          `@media(min-width:${minWidth}px){[data-flex-id="${id}"]{--flex-dir:${value}}}`,
        );
      }
    }
  }

  if (gapResponsive) {
    for (const { minWidth, value } of resolveResponsive(gap)) {
      if (minWidth === 0) {
        inlineVars["--flex-gap"] = `var(--spacing-${value})`;
      } else {
        mediaParts.push(
          `@media(min-width:${minWidth}px){[data-flex-id="${id}"]{--flex-gap:var(--spacing-${value})}}`,
        );
      }
    }
  }

  const responsiveStyle: CSSProperties = {
    display: "flex",
    flexDirection: (inlineVars["--flex-dir"] ?? baseDir) as CSSProperties["flexDirection"],
    gap: inlineVars["--flex-gap"] ?? `var(--spacing-${baseGap})`,
    alignItems: ALIGN_MAP[align],
    justifyContent: JUSTIFY_MAP[justify],
    flexWrap: wrap ? "wrap" : "nowrap",
    ...styleProp,
  };

  return (
    <>
      {mediaParts.length > 0 && <style dangerouslySetInnerHTML={{ __html: mediaParts.join("") }} />}
      <Tag className={className} style={responsiveStyle} data-flex-id={id}>
        {children}
      </Tag>
    </>
  );
}
