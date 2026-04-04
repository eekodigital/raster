import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './Progress.js';

describe('Progress', () => {
  it('shows the current value to screen readers', () => {
    render(<Progress value={40} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('40');
  });

  it('respects a custom max', () => {
    render(<Progress value={5} max={10} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('10');
  });

  it('announces a custom label', () => {
    render(<Progress value={75} label="Upload progress" />);
    expect(screen.getByRole('progressbar', { name: 'Upload progress' })).toBeDefined();
  });

  it('renders indeterminate state when value is null', () => {
    render(<Progress value={null} />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });
});
