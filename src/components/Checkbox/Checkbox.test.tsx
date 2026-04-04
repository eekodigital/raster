import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Checkbox, CheckboxGroup } from './Checkbox.js';

describe('Checkbox', () => {
  describe('mouse interaction', () => {
    it('is unchecked by default', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
    });

    it('toggles on click', () => {
      render(<Checkbox label="Accept terms" />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    });

    it('respects defaultChecked', () => {
      render(<Checkbox label="Accept terms" defaultChecked />);
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    });

    it('does not toggle when disabled', () => {
      render(<Checkbox label="Accept terms" disabled />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
    });

    it('can be found by its label', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeDefined();
    });
  });

  describe('keyboard interaction', () => {
    it('toggles on Space', async () => {
      render(<Checkbox label="Accept terms" />);
      screen.getByRole('checkbox').focus();
      await userEvent.keyboard(' ');
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    });
  });
});

describe('CheckboxGroup', () => {
  it('renders as a labelled group', () => {
    render(
      <CheckboxGroup legend="Preferences">
        <Checkbox label="One" />
      </CheckboxGroup>,
    );
    expect(screen.getByRole('group', { name: 'Preferences' })).toBeDefined();
  });

  it('shows hint text', () => {
    render(
      <CheckboxGroup legend="Preferences" hint="Select all that apply">
        <Checkbox label="One" />
      </CheckboxGroup>,
    );
    expect(screen.getByText('Select all that apply')).toBeDefined();
  });

  it('shows error message', () => {
    render(
      <CheckboxGroup legend="Preferences" error="Please select at least one">
        <Checkbox label="One" />
      </CheckboxGroup>,
    );
    expect(screen.getByText('Please select at least one')).toBeDefined();
  });
});
