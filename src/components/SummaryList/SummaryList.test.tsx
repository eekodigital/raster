import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  SummaryList,
  SummaryListActions,
  SummaryListKey,
  SummaryListRow,
  SummaryListValue,
} from './SummaryList.js';

describe('SummaryList', () => {
  it('renders key-value pairs', () => {
    render(
      <SummaryList>
        <SummaryListRow>
          <SummaryListKey>Name</SummaryListKey>
          <SummaryListValue>Alice</SummaryListValue>
        </SummaryListRow>
      </SummaryList>,
    );
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Alice')).toBeDefined();
  });

  it('renders action links', () => {
    render(
      <SummaryList>
        <SummaryListRow>
          <SummaryListKey>Email</SummaryListKey>
          <SummaryListValue>alice@example.com</SummaryListValue>
          <SummaryListActions>
            <a href="#">Change</a>
          </SummaryListActions>
        </SummaryListRow>
      </SummaryList>,
    );
    expect(screen.getByRole('link', { name: 'Change' })).toBeDefined();
  });
});
