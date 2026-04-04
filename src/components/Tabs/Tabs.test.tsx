import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import * as Tabs from './Tabs.js';

function renderTabs() {
  return render(
    <Tabs.Root defaultValue="a">
      <Tabs.List>
        <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
        <Tabs.Trigger value="c" disabled>
          Tab C
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">Content A</Tabs.Content>
      <Tabs.Content value="b">Content B</Tabs.Content>
      <Tabs.Content value="c">Content C</Tabs.Content>
    </Tabs.Root>,
  );
}

describe('Tabs', () => {
  describe('rendering and selection', () => {
    it('shows the default tab content', () => {
      renderTabs();
      expect(screen.getByText('Content A')).toBeDefined();
    });

    it('switches content when a tab is clicked', () => {
      renderTabs();
      fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tab B' }));
      expect(screen.getByText('Content B')).toBeDefined();
    });

    it('only the selected tab panel is visible', () => {
      renderTabs();
      expect(screen.getByText('Content A')).toBeDefined();
      expect(screen.queryByText('Content B')).toBeNull();
    });
  });

  describe('keyboard interaction', () => {
    it('ArrowRight moves focus to the next tab', async () => {
      renderTabs();
      screen.getByRole('tab', { name: 'Tab A' }).focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab B' }));
    });

    it('ArrowLeft moves focus to the previous tab', async () => {
      renderTabs();
      screen.getByRole('tab', { name: 'Tab B' }).focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab A' }));
    });

    it('skips disabled tabs when navigating', async () => {
      renderTabs();
      screen.getByRole('tab', { name: 'Tab B' }).focus();
      await userEvent.keyboard('{ArrowRight}');
      // Tab C is disabled, should skip to Tab A (wraps) or stay
      expect(document.activeElement).not.toBe(screen.getByRole('tab', { name: 'Tab C' }));
    });

    it('Home moves focus to the first tab', async () => {
      renderTabs();
      screen.getByRole('tab', { name: 'Tab B' }).focus();
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab A' }));
    });

    it('End moves focus to the last enabled tab', async () => {
      renderTabs();
      screen.getByRole('tab', { name: 'Tab A' }).focus();
      await userEvent.keyboard('{End}');
      // Tab C is disabled, so should focus Tab B
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab B' }));
    });
  });

  describe('accessibility', () => {
    it('has a tablist role', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeDefined();
    });

    it('active tab is selected, inactive is not', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Tab A', selected: true })).toBeDefined();
      expect(screen.getByRole('tab', { name: 'Tab B', selected: false })).toBeDefined();
    });
  });

  describe('Home/End with disabled boundary tabs', () => {
    function renderTabsDisabledFirst() {
      return render(
        <Tabs.Root defaultValue="b">
          <Tabs.List>
            <Tabs.Trigger value="a" disabled>
              Tab A
            </Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
            <Tabs.Trigger value="c">Tab C</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a">Content A</Tabs.Content>
          <Tabs.Content value="b">Content B</Tabs.Content>
          <Tabs.Content value="c">Content C</Tabs.Content>
        </Tabs.Root>,
      );
    }

    it('Home skips disabled first tab and activates first enabled tab', async () => {
      renderTabsDisabledFirst();
      screen.getByRole('tab', { name: 'Tab C' }).focus();
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab B' }));
    });

    it('End skips disabled last tab and activates last enabled tab', async () => {
      renderTabs();
      screen.getByRole('tab', { name: 'Tab A' }).focus();
      await userEvent.keyboard('{End}');
      // Tab C is disabled in renderTabs, so should focus Tab B
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tab B' }));
    });
  });

  describe('inactive content', () => {
    it('non-active tab content is not in the DOM', () => {
      renderTabs();
      expect(screen.queryByText('Content B')).toBeNull();
      expect(screen.queryByText('Content C')).toBeNull();
    });
  });
});
