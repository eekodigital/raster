import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Grid } from './Grid.js';

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid>
        <Grid.Col>A</Grid.Col>
        <Grid.Col>B</Grid.Col>
      </Grid>,
    );
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
  });

  it('renders as div by default', () => {
    const { container } = render(
      <Grid>
        <Grid.Col>Content</Grid.Col>
      </Grid>,
    );
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as a custom element', () => {
    const { container } = render(
      <Grid as="section">
        <Grid.Col>Content</Grid.Col>
      </Grid>,
    );
    expect(container.firstChild?.nodeName).toBe('SECTION');
  });

  it('builds grid-template-columns from static col widths', () => {
    const { container } = render(
      <Grid>
        <Grid.Col width="2fr">Main</Grid.Col>
        <Grid.Col width="1fr">Side</Grid.Col>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe('2fr 1fr');
  });

  it('defaults col width to 1fr', () => {
    const { container } = render(
      <Grid>
        <Grid.Col>A</Grid.Col>
        <Grid.Col>B</Grid.Col>
        <Grid.Col>C</Grid.Col>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe('1fr 1fr 1fr');
  });

  it('resolves "full" to 1fr', () => {
    const { container } = render(
      <Grid>
        <Grid.Col width="full">Content</Grid.Col>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe('1fr');
  });

  it('handles fixed widths', () => {
    const { container } = render(
      <Grid>
        <Grid.Col width="300px">Fixed</Grid.Col>
        <Grid.Col width="auto">Flex</Grid.Col>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe('300px auto');
  });

  it('applies gap class', () => {
    const { container } = render(
      <Grid gap="6">
        <Grid.Col>Content</Grid.Col>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('6');
  });

  it('applies alignment class', () => {
    const { container } = render(
      <Grid align="center">
        <Grid.Col>Content</Grid.Col>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('center');
  });

  it('renders responsive col widths with data-grid-id and style tag', () => {
    const { container } = render(
      <Grid>
        <Grid.Col width={{ base: 'full', md: '2fr' }}>Main</Grid.Col>
        <Grid.Col width={{ base: 'full', md: '1fr' }}>Side</Grid.Col>
      </Grid>,
    );
    const gridEl = container.querySelector('[data-grid-id]');
    expect(gridEl).toBeDefined();
    // Base template should use the base values
    expect((gridEl as HTMLElement).style.gridTemplateColumns).toBe('1fr 1fr');
    // Should inject a <style> for the media query
    const styleEl = container.querySelector('style');
    expect(styleEl).toBeDefined();
    expect(styleEl?.textContent).toContain('@media');
    expect(styleEl?.textContent).toContain('2fr 1fr');
  });
});

describe('Grid.Col', () => {
  it('renders as div by default', () => {
    const { container } = render(
      <Grid>
        <Grid.Col>Content</Grid.Col>
      </Grid>,
    );
    const col = container.querySelector('[class*="col"]');
    expect(col?.nodeName).toBe('DIV');
  });

  it('renders as a custom element', () => {
    const { container } = render(
      <Grid>
        <Grid.Col as="aside">Content</Grid.Col>
      </Grid>,
    );
    const col = container.querySelector('aside');
    expect(col).toBeDefined();
  });

  it('merges custom className', () => {
    render(
      <Grid>
        <Grid.Col className="custom">Content</Grid.Col>
      </Grid>,
    );
    const col = document.querySelector('.custom');
    expect(col).toBeDefined();
  });
});
