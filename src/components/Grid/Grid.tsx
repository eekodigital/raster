import { Children, useId } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { isResponsive, resolveResponsive } from '../../utils/responsive.js';
import type { ResponsiveValue } from '../../utils/responsive.js';
import * as styles from './Grid.css.js';

type Space =
  | '1'
  | '1-5'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24';
type Align = 'start' | 'center' | 'end' | 'stretch';

// -- Grid.Col ----------------------------------------------------------------

type ColWidth = string; // "1fr", "2fr", "300px", "auto", "full"

type ColProps = {
  children: ReactNode;
  width?: ResponsiveValue<ColWidth>;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/** Resolve a width value to a CSS grid track value. */
function resolveWidth(w: string): string {
  if (w === 'full') return '1fr';
  return w;
}

function Col({ children, width: _width, as: Tag = 'div', className, style: styleProp }: ColProps) {
  const cls = [styles.col, className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} style={styleProp}>
      {children}
    </Tag>
  );
}

Col.displayName = 'Grid.Col';

// -- Grid --------------------------------------------------------------------

type GridProps = {
  children: ReactNode;
  gap?: Space;
  align?: Align;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

function extractColWidths(children: ReactNode): ResponsiveValue<ColWidth>[] {
  const widths: ResponsiveValue<ColWidth>[] = [];
  Children.forEach(children, (child) => {
    if (child && typeof child === 'object' && 'props' in child) {
      const props = (child as { props: { width?: ResponsiveValue<ColWidth> } }).props;
      widths.push(props.width ?? '1fr');
    }
  });
  return widths;
}

function buildTemplateColumns(widths: ResponsiveValue<ColWidth>[]): {
  baseTemplate: string;
  mediaParts: string[];
} {
  // Check if any child has responsive widths
  const hasResponsive = widths.some((w) => isResponsive(w));

  if (!hasResponsive) {
    // All static — simple case
    const cols = widths.map((w) => resolveWidth(w as string));
    return { baseTemplate: cols.join(' '), mediaParts: [] };
  }

  // Collect all breakpoints across all children
  const breakpointSet = new Set<number>();
  for (const w of widths) {
    if (isResponsive(w)) {
      for (const { minWidth } of resolveResponsive(w)) {
        breakpointSet.add(minWidth);
      }
    } else {
      breakpointSet.add(0);
    }
  }

  const breakpoints = [...breakpointSet].toSorted((a, b) => a - b);
  const mediaParts: string[] = [];
  let baseTemplate = '';

  for (const bp of breakpoints) {
    // For each breakpoint, build the full template-columns value
    const cols = widths.map((w) => {
      if (!isResponsive(w)) return resolveWidth(w as string);
      const entries = resolveResponsive(w);
      // Find the largest entry <= bp
      let match = entries[0];
      for (const entry of entries) {
        if (entry.minWidth <= bp) match = entry;
      }
      return resolveWidth(String(match.value));
    });

    const template = cols.join(' ');
    if (bp === 0) {
      baseTemplate = template;
    } else {
      mediaParts.push(
        `@media(min-width:${bp}px){[data-grid-id="%ID%"]{grid-template-columns:${template}}}`,
      );
    }
  }

  return { baseTemplate, mediaParts };
}

function GridRoot({
  children,
  gap = '4',
  align = 'stretch',
  as: Tag = 'div',
  className,
  style: styleProp,
}: GridProps) {
  const widths = extractColWidths(children);
  const { baseTemplate, mediaParts } = buildTemplateColumns(widths);
  const hasResponsive = mediaParts.length > 0;
  const id = useId();

  const cls = [styles.grid, styles.gaps[gap], styles.alignments[align], className]
    .filter(Boolean)
    .join(' ');

  const gridStyle: CSSProperties = {
    gridTemplateColumns: baseTemplate,
    ...styleProp,
  };

  if (!hasResponsive) {
    return (
      <Tag className={cls} style={gridStyle}>
        {children}
      </Tag>
    );
  }

  const css = mediaParts.map((p) => p.replaceAll('%ID%', id)).join('');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Tag className={cls} style={gridStyle} data-grid-id={id}>
        {children}
      </Tag>
    </>
  );
}

GridRoot.displayName = 'Grid';

export const Grid = Object.assign(GridRoot, { Col });
