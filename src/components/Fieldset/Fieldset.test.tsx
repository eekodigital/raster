import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Fieldset } from './Fieldset.js';

describe('Fieldset', () => {
  it('renders a fieldset element', () => {
    const { container } = render(
      <Fieldset legend="Options">
        <input />
      </Fieldset>,
    );
    expect(container.querySelector('fieldset')).toBeDefined();
  });

  it('renders a legend with the provided text', () => {
    render(
      <Fieldset legend="Contact details">
        <input />
      </Fieldset>,
    );
    expect(screen.getByText('Contact details').tagName).toBe('LEGEND');
  });

  it('renders children', () => {
    render(
      <Fieldset legend="Options">
        <label>Option A</label>
      </Fieldset>,
    );
    expect(screen.getByText('Option A')).toBeDefined();
  });

  it('renders hint text when provided', () => {
    render(
      <Fieldset legend="Preferences" hint="Select all that apply">
        <input />
      </Fieldset>,
    );
    expect(screen.getByText('Select all that apply')).toBeDefined();
  });

  it('accepts className', () => {
    const { container } = render(
      <Fieldset legend="Group" className="custom">
        <input />
      </Fieldset>,
    );
    expect(container.querySelector('fieldset')?.className).toContain('custom');
  });
});
