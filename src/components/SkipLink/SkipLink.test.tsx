import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink.js';

describe('SkipLink', () => {
  it('links to #main-content by default', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Skip to main content' }).getAttribute('href')).toBe(
      '#main-content',
    );
  });

  it('accepts a custom href and label', () => {
    render(<SkipLink href="#nav">Skip to nav</SkipLink>);
    const link = screen.getByRole('link', { name: 'Skip to nav' });
    expect(link.getAttribute('href')).toBe('#nav');
  });

  it('is focusable via keyboard', async () => {
    render(<SkipLink />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Skip to main content' }));
  });
});
