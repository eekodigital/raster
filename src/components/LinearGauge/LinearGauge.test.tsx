import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinearGauge } from './LinearGauge.js';

describe('LinearGauge', () => {
  it('renders with role="meter"', () => {
    render(<LinearGauge value={42} max={100} aria-label="Progress" />);
    expect(screen.getByRole('meter', { name: 'Progress' })).toBeDefined();
  });

  it('sets aria-valuenow and aria-valuemax', () => {
    render(<LinearGauge value={42} max={100} aria-label="Score" />);
    const meter = screen.getByRole('meter', { name: 'Score' });
    expect(meter.getAttribute('aria-valuenow')).toBe('42');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
  });

  it('displays label and value', () => {
    render(<LinearGauge value={72} max={86} label="Assessed" aria-label="Assessed" />);
    expect(screen.getByText('Assessed')).toBeDefined();
    expect(screen.getByText('72 / 86')).toBeDefined();
  });

  it('uses custom format function', () => {
    render(
      <LinearGauge
        value={75}
        max={100}
        label="Complete"
        format={(v) => `${v}%`}
        aria-label="Complete"
      />,
    );
    expect(screen.getByText('75% / 100%')).toBeDefined();
  });

  it('clamps at 100%', () => {
    render(<LinearGauge value={150} max={100} aria-label="Over" />);
    expect(screen.getByRole('meter', { name: 'Over' }).getAttribute('aria-valuenow')).toBe('150');
  });
});
