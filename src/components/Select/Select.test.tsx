import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select.js';

const options = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON', disabled: true },
];

describe('Select', () => {
  describe('rendering', () => {
    it('shows placeholder text when no value selected', () => {
      render(<Select options={options} placeholder="Choose format" />);
      expect(screen.getByText('Choose format')).toBeDefined();
    });

    it('shows the selected value label', () => {
      render(<Select options={options} value="pdf" />);
      expect(screen.getByText('PDF')).toBeDefined();
    });
  });

  describe('mouse interaction', () => {
    it('opens the listbox on click and shows options', () => {
      render(<Select options={options} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeDefined();
      expect(screen.getByRole('option', { name: 'PDF' })).toBeDefined();
      expect(screen.getByRole('option', { name: 'CSV' })).toBeDefined();
    });

    it('calls onValueChange when an option is selected', () => {
      const onChange = vi.fn();
      render(<Select options={options} onValueChange={onChange} />);
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'PDF' }));
      expect(onChange).toHaveBeenCalledWith('pdf');
    });

    it('does not open when disabled', () => {
      render(<Select options={options} disabled />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('disabled options cannot be selected', () => {
      const onChange = vi.fn();
      render(<Select options={options} onValueChange={onChange} />);
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'JSON' }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('renders icons when provided', () => {
      render(<Select options={[{ value: 'pdf', label: 'PDF', icon: <span>📄</span> }]} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('📄')).toBeDefined();
    });
  });

  describe('keyboard interaction', () => {
    it.each(['{Enter}', ' ', '{ArrowDown}'])('opens on %s', async (key) => {
      render(<Select options={options} />);
      screen.getByRole('combobox').focus();
      await userEvent.keyboard(key);
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
    });

    it('ArrowUp navigates to the previous option', async () => {
      render(<Select options={options} />);
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
      // Focus should start on first enabled option (PDF, index 0)
      // Press ArrowDown to go to CSV, then ArrowUp to go back to PDF
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowUp' });
      const pdfOption = screen.getByRole('option', { name: 'PDF' });
      expect(pdfOption.dataset.highlighted).toBe('');
    });

    it('Home focuses the first enabled option', async () => {
      render(<Select options={options} />);
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
      // Move down first, then press Home
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Home' });
      const pdfOption = screen.getByRole('option', { name: 'PDF' });
      expect(pdfOption.dataset.highlighted).toBe('');
    });

    it('End focuses the last enabled option', async () => {
      render(<Select options={options} />);
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'End' });
      // JSON is disabled, so last enabled is CSV
      const csvOption = screen.getByRole('option', { name: 'CSV' });
      expect(csvOption.dataset.highlighted).toBe('');
    });

    it('Enter selects the focused option', async () => {
      const onChange = vi.fn();
      render(<Select options={options} onValueChange={onChange} />);
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
      // Move to CSV
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('csv');
    });

    it('Space selects the focused option', async () => {
      const onChange = vi.fn();
      render(<Select options={options} onValueChange={onChange} />);
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
      // First focused is PDF
      fireEvent.keyDown(screen.getByRole('listbox'), { key: ' ' });
      expect(onChange).toHaveBeenCalledWith('pdf');
    });
  });

  describe('click outside', () => {
    it('closes the listbox when clicking outside', async () => {
      render(<Select options={options} />);
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('listbox')).toBeDefined());
      // Click on the document body (outside)
      fireEvent.mouseDown(document.body);
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    });
  });
});
