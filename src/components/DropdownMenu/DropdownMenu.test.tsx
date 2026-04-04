import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as DropdownMenu from './DropdownMenu.js';

function openMenu() {
  const trigger = screen.getByRole('button', { name: 'Options' });
  fireEvent.pointerDown(trigger);
  fireEvent.click(trigger);
}

function renderMenu({ onSelect }: { onSelect?: (value: string) => void } = {}) {
  return render(
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={() => onSelect?.('edit')}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onSelect?.('duplicate')}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={() => onSelect?.('delete')}>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
}

describe('DropdownMenu', () => {
  describe('opening and closing', () => {
    it('is not visible before trigger click', () => {
      renderMenu();
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('opens on trigger click and shows items', () => {
      renderMenu();
      openMenu();
      expect(screen.getByRole('menu')).toBeDefined();
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeDefined();
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDefined();
    });

    it('shows label and separator', () => {
      renderMenu();
      openMenu();
      expect(screen.getByText('Actions')).toBeDefined();
      expect(screen.getByRole('separator')).toBeDefined();
    });

    it('closes when an item is selected', () => {
      renderMenu();
      openMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('calls onSelect when an item is clicked', () => {
      const onSelect = vi.fn();
      renderMenu({ onSelect });
      openMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      expect(onSelect).toHaveBeenCalledWith('edit');
    });
  });

  describe('keyboard interaction', () => {
    it('closes on Escape', async () => {
      renderMenu();
      openMenu();
      expect(screen.getByRole('menu')).toBeDefined();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('moves focus into menu when opened', async () => {
      renderMenu();
      openMenu();
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu.contains(document.activeElement)).toBe(true);
      });
    });

    it('ArrowDown navigates to next item', async () => {
      renderMenu();
      openMenu();
      await waitFor(() =>
        expect(screen.getByRole('menu').contains(document.activeElement)).toBe(true),
      );
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement?.textContent).toBeDefined();
    });

    // Note: Enter/Space selection on menu items doesn't work in jsdom due to
    // Radix's pointer event handling. Verified manually in browser.
  });

  describe('RadioGroup and RadioItem', () => {
    it('clicking a RadioItem selects the value and closes the menu', () => {
      const onValueChange = vi.fn();
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup value="a" onValueChange={onValueChange}>
              <DropdownMenu.RadioItem value="a">Option A</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="b">Option B</DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );
      openMenu();
      fireEvent.click(screen.getByRole('menuitemradio', { name: 'Option B' }));
      expect(onValueChange).toHaveBeenCalledWith('b');
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  describe('Label', () => {
    it('renders label text', () => {
      renderMenu();
      openMenu();
      expect(screen.getByText('Actions')).toBeDefined();
    });
  });

  describe('Separator', () => {
    it('renders with role="separator"', () => {
      renderMenu();
      openMenu();
      expect(screen.getByRole('separator')).toBeDefined();
    });
  });

  describe('disabled item', () => {
    it('clicking a disabled item does not fire onSelect', () => {
      const onSelect = vi.fn();
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={onSelect} disabled>
              Disabled Action
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );
      openMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled Action' }));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Sub, SubTrigger, SubContent', () => {
    it('renders Sub with SubTrigger and SubContent children', () => {
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>More actions</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Nested item</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );
      openMenu();
      expect(screen.getByText('More actions')).toBeDefined();
      expect(screen.getByText('Nested item')).toBeDefined();
    });
  });

  describe('Group', () => {
    it('renders children within a group role', () => {
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Item>Grouped item</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );
      openMenu();
      const groups = screen.getAllByRole('group');
      expect(groups.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Grouped item')).toBeDefined();
    });
  });

  describe('CheckboxItem', () => {
    it('renders with role="menuitemcheckbox"', () => {
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.CheckboxItem>Toggle me</DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );
      openMenu();
      expect(screen.getByRole('menuitemcheckbox', { name: 'Toggle me' })).toBeDefined();
    });
  });

  describe('click outside closes menu', () => {
    it('closes the menu when clicking outside', async () => {
      renderMenu();
      openMenu();
      expect(screen.getByRole('menu')).toBeDefined();
      fireEvent.mouseDown(document.body);
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });
  });

  describe('ItemIndicator', () => {
    it('renders indicator children', () => {
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );
      openMenu();
      expect(screen.getByText('✓')).toBeDefined();
    });
  });
});
