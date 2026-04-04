import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextInput } from './TextInput.js';

describe('TextInput', () => {
  it('renders with a placeholder', () => {
    render(<TextInput placeholder="Enter name" aria-label="Name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeDefined();
  });

  it('accepts typed input', async () => {
    const onChange = vi.fn();
    render(<TextInput aria-label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextInput disabled aria-label="Field" />);
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
  });
});
