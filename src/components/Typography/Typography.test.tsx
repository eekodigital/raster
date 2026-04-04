import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading, Text } from './Typography.js';

describe('Heading', () => {
  it('renders as h2 by default', () => {
    render(<Heading>Section title</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeDefined();
  });

  it('renders the correct heading level', () => {
    render(<Heading level="1">Page title</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('allows overriding the element with as prop', () => {
    render(
      <Heading level="3" as="h1">
        Title
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });
});

describe('Text', () => {
  it('renders its content', () => {
    render(<Text>Hello world</Text>);
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('renders as a different element via as prop', () => {
    const { container } = render(<Text as="span">Inline</Text>);
    expect(container.querySelector('span')).toBeDefined();
  });
});
