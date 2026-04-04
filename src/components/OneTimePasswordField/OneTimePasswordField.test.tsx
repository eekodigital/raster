import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OneTimePasswordField } from './OneTimePasswordField.js';

describe('OneTimePasswordField', () => {
  it('renders 6 inputs by default', () => {
    render(<OneTimePasswordField />);
    expect(screen.getAllByRole('textbox').length).toBe(6);
  });

  it('renders the specified number of inputs', () => {
    render(<OneTimePasswordField length={4} />);
    expect(screen.getAllByRole('textbox').length).toBe(4);
  });

  it('all inputs are disabled when disabled prop is set', () => {
    render(<OneTimePasswordField disabled />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs.every((el) => el.disabled)).toBe(true);
  });
});
