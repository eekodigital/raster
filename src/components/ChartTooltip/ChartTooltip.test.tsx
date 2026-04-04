import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartTooltip } from './ChartTooltip.js';

describe('ChartTooltip', () => {
  it('renders with role="tooltip" and content', () => {
    render(<ChartTooltip id="tip-1" visible={true} x={100} y={50} content="Hello" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe('Hello');
  });

  it('sets data-visible when visible is true', () => {
    render(<ChartTooltip id="tip-1" visible={true} x={100} y={50} content="Visible" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('data-visible')).toBeDefined();
  });

  it('does not set data-visible when visible is false', () => {
    render(<ChartTooltip id="tip-1" visible={false} x={0} y={0} content="Hidden" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('data-visible')).toBeNull();
  });

  it('positions with left and top styles', () => {
    render(<ChartTooltip id="tip-2" visible={true} x={120} y={80} content="Positioned" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.left).toBe('120px');
    expect(tooltip.style.top).toBe('80px');
  });
});
