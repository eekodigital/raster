import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Flex } from './Flex.js';

describe('Flex', () => {
  it('renders children', () => {
    render(
      <Flex>
        <span>A</span>
        <span>B</span>
      </Flex>,
    );
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
  });

  it('renders as div by default', () => {
    const { container } = render(<Flex>Content</Flex>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as a custom element via as prop', () => {
    const { container } = render(<Flex as="nav">Content</Flex>);
    expect(container.firstChild?.nodeName).toBe('NAV');
  });

  it('applies flex direction class for static value', () => {
    const { container } = render(<Flex direction="column">Content</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('column');
  });

  it('applies gap class for static value', () => {
    const { container } = render(<Flex gap="6">Content</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('6');
  });

  it('applies alignment class', () => {
    const { container } = render(<Flex align="center">Content</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('center');
  });

  it('applies justify class', () => {
    const { container } = render(<Flex justify="between">Content</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('between');
  });

  it('applies wrap class when wrap is true', () => {
    const { container } = render(<Flex wrap>Content</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('wrap');
  });

  it('merges custom className', () => {
    const { container } = render(<Flex className="custom">Content</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom');
  });

  it('renders responsive direction with inline styles', () => {
    const { container } = render(<Flex direction={{ base: 'column', md: 'row' }}>Content</Flex>);
    // Should use inline styles for responsive values
    const el = container.querySelector('[data-flex-id]');
    expect(el).toBeDefined();
    expect(el?.getAttribute('style')).toContain('column');
  });

  it('renders responsive gap with inline styles', () => {
    const { container } = render(<Flex gap={{ base: '2', '600px': '6' }}>Content</Flex>);
    const el = container.querySelector('[data-flex-id]');
    expect(el).toBeDefined();
    expect(el?.getAttribute('style')).toContain('--spacing-2');
  });
});
