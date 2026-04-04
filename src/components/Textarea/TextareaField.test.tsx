import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextareaField } from './TextareaField.js';

describe('TextareaField', () => {
  it('renders a textarea', () => {
    render(<TextareaField label="Notes" />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders the label', () => {
    render(<TextareaField label="Notes" />);
    expect(screen.getByText('Notes')).toBeDefined();
  });

  it('associates label with textarea via id', () => {
    render(<TextareaField label="Notes" id="notes" />);
    expect(screen.getByLabelText('Notes')).toBeDefined();
  });

  it('renders hint text', () => {
    render(<TextareaField label="Notes" hint="Be concise" />);
    expect(screen.getByText('Be concise')).toBeDefined();
  });

  it('renders error text', () => {
    render(<TextareaField label="Notes" error="Required" />);
    expect(screen.getByText('Required')).toBeDefined();
  });

  it('marks textarea as aria-invalid when error is set', () => {
    render(<TextareaField label="Notes" error="Required" />);
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  });

  it('shows character counter when maxLength is provided', () => {
    render(<TextareaField label="Bio" maxLength={100} />);
    expect(screen.getByText('100 characters remaining')).toBeDefined();
  });

  it('decrements counter as user types', () => {
    render(<TextareaField label="Bio" maxLength={10} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(screen.getByText('5 characters remaining')).toBeDefined();
  });

  it('shows singular "character remaining" at 1 left', () => {
    render(<TextareaField label="Bio" maxLength={5} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hell' } });
    expect(screen.getByText('1 character remaining')).toBeDefined();
  });

  it('shows "too many" message when over limit', () => {
    render(<TextareaField label="Bio" maxLength={5} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'toolongtext' } });
    expect(screen.getByText('6 characters too many')).toBeDefined();
  });

  it('does not show counter when maxLength is not set', () => {
    render(<TextareaField label="Bio" />);
    expect(screen.queryByText(/characters/)).toBeNull();
  });

  it('counter has aria-live="polite"', () => {
    render(<TextareaField label="Bio" maxLength={100} />);
    expect(screen.getByText('100 characters remaining').getAttribute('aria-live')).toBe('polite');
  });
});
