import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import * as Popover from './Popover.js';

function renderPopover() {
  return render(
    <Popover.Root>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>
        <input placeholder="Name" />
        <Popover.Close>Close</Popover.Close>
      </Popover.Content>
    </Popover.Root>,
  );
}

describe('Popover', () => {
  describe('opening and closing', () => {
    it('is not visible before trigger click', () => {
      renderPopover();
      expect(screen.queryByPlaceholderText('Name')).toBeNull();
    });

    it('opens on trigger click', () => {
      renderPopover();
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByPlaceholderText('Name')).toBeDefined();
    });

    it('closes via the Close button', () => {
      renderPopover();
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByPlaceholderText('Name')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByPlaceholderText('Name')).toBeNull();
    });
  });

  describe('keyboard interaction', () => {
    it('closes on Escape', async () => {
      renderPopover();
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByPlaceholderText('Name')).toBeDefined();

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByPlaceholderText('Name')).toBeNull());
    });

    it('returns focus to trigger when closed', async () => {
      renderPopover();
      const trigger = screen.getByRole('button', { name: 'Open' });
      fireEvent.click(trigger);

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
  });
});
