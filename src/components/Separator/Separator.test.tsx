import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from './Separator.js';

describe('Separator', () => {
  it('is decorative by default (hidden from screen readers)', () => {
    const { container } = render(<Separator />);
    expect((container.firstChild as Element).getAttribute('role')).toBe('none');
  });

  it('has role="separator" when not decorative', () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole('separator')).toBeDefined();
  });
});
