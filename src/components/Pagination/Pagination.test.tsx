import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination.js';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a nav with aria-label="Pagination"', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeDefined();
  });

  it('marks the current page with aria-current="page"', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 3' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('calls onPageChange with next page when Next is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page when Prev is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables Previous on the first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(
      (screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('disables Next on the last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('calls onPageChange when a page number button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('renders ellipsis for large page counts', () => {
    const { container } = render(<Pagination page={5} totalPages={20} onPageChange={() => {}} />);
    const ellipses = container.querySelectorAll('[aria-hidden]');
    expect(ellipses.length).toBeGreaterThan(0);
  });
});
