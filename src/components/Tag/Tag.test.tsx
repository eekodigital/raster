import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tag } from './Tag.js';

describe('Tag', () => {
  it('renders its content', () => {
    render(<Tag>Beta</Tag>);
    expect(screen.getByText('Beta')).toBeDefined();
  });

  it.each(['neutral', 'success', 'danger', 'warning', 'info'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<Tag variant={variant}>{variant}</Tag>);
      expect(screen.getByText(variant)).toBeDefined();
    },
  );
});
