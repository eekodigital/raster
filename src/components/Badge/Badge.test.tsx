import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge.js';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>12</Badge>);
    expect(screen.getByText('12')).toBeDefined();
  });

  it('renders all variants without error', () => {
    render(
      <>
        <Badge>Default</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="warning">Warning</Badge>
      </>,
    );
    expect(screen.getByText('Default')).toBeDefined();
    expect(screen.getByText('Primary')).toBeDefined();
    expect(screen.getByText('Success')).toBeDefined();
    expect(screen.getByText('Danger')).toBeDefined();
    expect(screen.getByText('Warning')).toBeDefined();
  });
});
