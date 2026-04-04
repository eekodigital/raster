import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedButtons } from './SegmentedButtons.js';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('SegmentedButtons', () => {
  it('renders all options as radio items', () => {
    render(
      <SegmentedButtons options={OPTIONS} value="a" onValueChange={() => {}} aria-label="Test" />,
    );
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeDefined();
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeDefined();
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeDefined();
  });

  it('checks the selected value', () => {
    render(
      <SegmentedButtons options={OPTIONS} value="b" onValueChange={() => {}} aria-label="Test" />,
    );
    expect(screen.getByRole('radio', { name: 'Beta' }).getAttribute('data-state')).toBe('checked');
    expect(screen.getByRole('radio', { name: 'Alpha' }).getAttribute('data-state')).toBe(
      'unchecked',
    );
  });

  it('calls onValueChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(
      <SegmentedButtons options={OPTIONS} value="a" onValueChange={onChange} aria-label="Test" />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Gamma' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('renders as a radiogroup', () => {
    render(
      <SegmentedButtons options={OPTIONS} value="a" onValueChange={() => {}} aria-label="Status" />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Status' })).toBeDefined();
  });

  it('applies custom colour styles to options', () => {
    const coloured = [{ value: 'x', label: 'Pass', color: 'green', bg: '#e0ffe0' }];
    render(
      <SegmentedButtons options={coloured} value="x" onValueChange={() => {}} aria-label="Test" />,
    );
    const item = screen.getByRole('radio', { name: 'Pass' });
    expect(item.style.getPropertyValue('--segment-color')).toBe('green');
    expect(item.style.getPropertyValue('--segment-bg')).toBe('#e0ffe0');
  });

  describe('keyboard navigation', () => {
    it.each([
      ['ArrowRight', 'a', 'Alpha', 'b'],
      ['ArrowDown', 'a', 'Alpha', 'b'],
    ])('%s moves to next option and selects it', (key, value, focusLabel, expected) => {
      const onChange = vi.fn();
      render(
        <SegmentedButtons
          options={OPTIONS}
          value={value}
          onValueChange={onChange}
          aria-label="Test"
        />,
      );
      screen.getByRole('radio', { name: focusLabel }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key });
      expect(onChange).toHaveBeenCalledWith(expected);
    });

    it.each([['ArrowLeft', 'b', 'Beta', 'a']])(
      '%s moves to previous option and selects it',
      (key, value, focusLabel, expected) => {
        const onChange = vi.fn();
        render(
          <SegmentedButtons
            options={OPTIONS}
            value={value}
            onValueChange={onChange}
            aria-label="Test"
          />,
        );
        screen.getByRole('radio', { name: focusLabel }).focus();
        fireEvent.keyDown(screen.getByRole('radiogroup'), { key });
        expect(onChange).toHaveBeenCalledWith(expected);
      },
    );

    it.each([
      ['ArrowRight', 'c', 'Gamma', 'a'],
      ['ArrowLeft', 'a', 'Alpha', 'c'],
    ])('%s wraps around from %s', (key, value, focusLabel, expected) => {
      const onChange = vi.fn();
      render(
        <SegmentedButtons
          options={OPTIONS}
          value={value}
          onValueChange={onChange}
          aria-label="Test"
        />,
      );
      screen.getByRole('radio', { name: focusLabel }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key });
      expect(onChange).toHaveBeenCalledWith(expected);
    });

    it('ignores unrelated keys', () => {
      const onChange = vi.fn();
      render(
        <SegmentedButtons options={OPTIONS} value="a" onValueChange={onChange} aria-label="Test" />,
      );
      const alpha = screen.getByRole('radio', { name: 'Alpha' });
      alpha.focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Tab' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('renders a hidden input when name is provided', () => {
    const { container } = render(
      <SegmentedButtons
        options={OPTIONS}
        value="b"
        onValueChange={() => {}}
        name="choice"
        aria-label="Test"
      />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('choice');
    expect(hidden.value).toBe('b');
  });
});
