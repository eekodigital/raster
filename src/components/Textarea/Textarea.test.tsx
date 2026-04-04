import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea.js';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('passes through HTML attributes', () => {
    render(<Textarea placeholder="Write something..." rows={5} />);
    const el = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(el.getAttribute('placeholder')).toBe('Write something...');
    expect(el.getAttribute('rows')).toBe('5');
  });

  it('applies error class when hasError is true', () => {
    render(<Textarea hasError />);
    expect(screen.getByRole('textbox').className).toContain('error');
  });

  it('does not apply error class when hasError is false', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox').className).not.toContain('error');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea disabled />);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(true);
  });
});
