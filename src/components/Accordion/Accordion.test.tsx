import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import * as Accordion from './Accordion.js';

function renderAccordion(type: 'single' | 'multiple' = 'single') {
  if (type === 'single') {
    return render(
      <Accordion.Root type="single" collapsible>
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>Section A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Content A</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Header>
            <Accordion.Trigger>Section B</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Content B</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="c">
          <Accordion.Header>
            <Accordion.Trigger>Section C</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Content C</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
  }
  return render(
    <Accordion.Root type="multiple">
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>Section A</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Content A</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger>Section B</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Content B</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>,
  );
}

describe('Accordion', () => {
  describe('opening and closing', () => {
    it('all items are closed by default', () => {
      renderAccordion();
      expect(screen.queryByText('Content A')).toBeNull();
      expect(screen.queryByText('Content B')).toBeNull();
    });

    it('opens an item when its trigger is clicked', () => {
      renderAccordion();
      fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
      expect(screen.getByText('Content A')).toBeDefined();
    });

    it('closes an open item when clicked again (collapsible)', () => {
      renderAccordion();
      fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
      expect(screen.getByText('Content A')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
      expect(screen.queryByText('Content A')).toBeNull();
    });

    it('in single mode, opening one item closes the other', () => {
      renderAccordion('single');
      fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
      expect(screen.getByText('Content A')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Section B' }));
      expect(screen.queryByText('Content A')).toBeNull();
      expect(screen.getByText('Content B')).toBeDefined();
    });

    it('in multiple mode, several items can be open simultaneously', () => {
      renderAccordion('multiple');
      fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
      fireEvent.click(screen.getByRole('button', { name: 'Section B' }));
      expect(screen.getByText('Content A')).toBeDefined();
      expect(screen.getByText('Content B')).toBeDefined();
    });
  });

  describe('keyboard interaction', () => {
    it('Enter toggles an item', async () => {
      renderAccordion();
      screen.getByRole('button', { name: 'Section A' }).focus();
      await userEvent.keyboard('{Enter}');
      expect(screen.getByText('Content A')).toBeDefined();
    });

    it('Space toggles an item', async () => {
      renderAccordion();
      screen.getByRole('button', { name: 'Section A' }).focus();
      await userEvent.keyboard(' ');
      expect(screen.getByText('Content A')).toBeDefined();
    });

    it('ArrowDown moves focus to the next trigger', async () => {
      renderAccordion();
      screen.getByRole('button', { name: 'Section A' }).focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Section B' }));
    });

    it('ArrowUp moves focus to the previous trigger', async () => {
      renderAccordion();
      screen.getByRole('button', { name: 'Section B' }).focus();
      await userEvent.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Section A' }));
    });

    it('Home moves focus to the first trigger', async () => {
      renderAccordion();
      screen.getByRole('button', { name: 'Section C' }).focus();
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Section A' }));
    });

    it('End moves focus to the last trigger', async () => {
      renderAccordion();
      screen.getByRole('button', { name: 'Section A' }).focus();
      await userEvent.keyboard('{End}');
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Section C' }));
    });
  });
});
