import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotificationBanner } from './NotificationBanner.js';

describe('NotificationBanner', () => {
  it('renders children', () => {
    render(<NotificationBanner>Your changes were saved.</NotificationBanner>);
    expect(screen.getByText('Your changes were saved.')).toBeDefined();
  });

  it('renders a title when provided', () => {
    render(<NotificationBanner title="Success">Details here.</NotificationBanner>);
    expect(screen.getByText('Success')).toBeDefined();
  });

  it('defaults to role="region"', () => {
    render(<NotificationBanner>Message</NotificationBanner>);
    expect(screen.getByRole('region')).toBeDefined();
  });

  it('uses role="alert" when specified', () => {
    render(<NotificationBanner role="alert">Urgent message</NotificationBanner>);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('uses role="status" when specified', () => {
    render(<NotificationBanner role="status">Status update</NotificationBanner>);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it.each(['info', 'success', 'warning', 'danger'] as const)(
    'renders without error for variant %s',
    (variant) => {
      render(<NotificationBanner variant={variant}>Message</NotificationBanner>);
      expect(screen.getByText('Message')).toBeDefined();
    },
  );
});
